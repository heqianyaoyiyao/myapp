import { getResponse, getResponseSSE } from "../until/chat.js";
import express from "express";
import db from "../sql/connectDB.js";

const router = express.Router();

// 全局连接池，用于存储 SSE 客户端连接
const clients = [];

// 系统角色配置
const systemRole = {
  role: "system",
  content: "你是hyx的全能助手，你叫HYXBOT，能回答任何问题。",
};

// 默认路由
router.get("/", (req, res) => {
  res.send("respond with a resource -- chat");
});

// 普通问题处理接口
router.post("/question", async (req, res) => {
  const { messages } = req.body;

  const param = [systemRole];

  try {
    if (messages && messages.length) {
      messages.forEach((item) => {
        param.push({
          role: "user",
          content: item,
        });
      });
    }

    const data = await getResponse(param);
    res.success(data);
  } catch (error) {
    console.error("获取响应时发生错误:", error);
    res.error("服务器内部错误", 500);
  }
});

// SSE 推送接口
router.post("/getAnswer", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  console.log(`Received question: ${question}`);

  res.success({}); // 返回状态值

  const param = [systemRole, { role: "user", content: question }];

  // 手动调用 SSE 推送逻辑
  await pushToQuestionStream(param);
});

// SSE 长连接接口
router.get("/questionStream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

// 手动推送消息到所有连接的客户端
async function pushToQuestionStream(param) {
  try {
    await getResponseSSE(param, (chunk) => {
      clients.forEach((client) => {
        client.write(`data: ${chunk}\n\n`);
      });
    });

    clients.forEach((client) => {
      client.write(`data: {"status": "done"}\n\n`);
    });
  } catch (error) {
    console.error("Error pushing to questionStream:", error);
    clients.forEach((client) => {
      client.write(
        `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
      );
    });
  }
}

// SSE 问答接口
router.post("/questionSSE", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const user = req.user;

  if (!user || !user.id || isNaN(user.id)) {
    return res.status(400).json({ error: "Missing or invalid userId" });
  }

  const param = [systemRole];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const lastChatsSql = `
      SELECT question, answer, created_at
      FROM chat_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const [lastChats] = await db.query(lastChatsSql, [user.id]);

    if (lastChats && lastChats.length > 0) {
      lastChats.reverse();
      lastChats.forEach((chat) => {
        param.push({ role: "user", content: chat.question });
        param.push({ role: "assistant", content: chat.answer });
      });
    }

    param.push({ role: "user", content: question });

    const randomId = Math.floor(Math.random() * 10000000000);
    let result = "";

    res.write(
      `event: message\ndata: ${JSON.stringify({
        randomId,
        status: "start",
        content: "",
        result: "",
      })}\n\n`
    );

    await getResponseSSE(param, (chunk) => {
      result += chunk;
      res.write(
        `event: message\ndata: ${JSON.stringify({
          randomId,
          status: "continue",
          content: chunk,
          result,
        })}\n\n`
      );
    });

    res.write(
      `event: complete\ndata: ${JSON.stringify({
        randomId,
        status: "done",
        content: "",
        result,
      })}\n\n`
    );
    res.end();

    const now = new Date();
    await db.query(
      "INSERT INTO chat_records (user_name, user_id, question, answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [user.username, user.id, question, result, now, now]
    );
  } catch (error) {
    console.error("Error in questionSSE:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
    );
    res.end();
  }
});

// 获取对话列表
router.get("/getChatList", async (req, res) => {
  const { limit = 10, page = 1, sort = "desc" } = req.query;
  const user = req.user;

  if (!user || !user.id || isNaN(user.id)) {
    return res.error('Missing or invalid userId', 400)
  }

  try {
    const orderClause = sort === "asc" ? "ASC" : "DESC";
    const offset = (page - 1) * limit;

    const [totalResults] = await db.query(
      "SELECT COUNT(*) AS total FROM chat_records WHERE user_id = ?",
      [user.id]
    );
    const total = totalResults[0].total;
    const pages = Math.ceil(total / limit);

    const [rows] = await db.query(
      `SELECT question, answer, created_at 
       FROM chat_records 
       WHERE user_id = ?
       ORDER BY created_at ${orderClause}
       LIMIT ? OFFSET ?`,
      [user.id, parseInt(limit), parseInt(offset)]
    );

    if (!rows || rows.length === 0) {
      return res.success({ list: [], total, page, pages })
    }

    const result = rows.flatMap((record) => [
      { type: "question", content: record.question },
      { type: "answer", content: record.answer },
    ])
    res.success({ list: result, total, page, pages })
  } catch (error) {
    return res.error('Internal Server Error', 500)
  }
});

// 接口sse返回
// router.get("/questionSSE", async (req, res) => {
//   // const { question } = req.body; // 从请求体中获取 question 参数
//   const question = req.query.question;

//   if (!question) {
//     return res.error(); // 返回 400 错误
//   }

//   const param = [systemRole, { role: "user", content: question }];

//   // 设置 SSE 响应头
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   try {
//     // 调用 getResponseSSE 并逐步推送流式数据
//     const randomId = Math.floor(Math.random() * 10000000000);
//     await getResponseSSE(param, (chunk) => {
//       // res.write(`data: ${chunk}\n\n`); // 推送数据块到前端
//       res.write(
//         `event: message\ndata: {"randomId": ${randomId};"status": "continue";content: ${chunk}}\n\n`
//       ); // 推送数据块到前端
//     });

//     // 推送完成事件
//     res.write(
//       `event: complete\ndata: {"randomId": ${randomId};"status": "done"}\n\n`
//     );
//     res.end(); // 结束 SSE 流
//   } catch (error) {
//     console.error("Error in questionSSE:", error);

//     // 推送错误事件
//     res.write(
//       `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
//     );
//     res.end(); // 结束 SSE 流
//   }
// });

export default router;
