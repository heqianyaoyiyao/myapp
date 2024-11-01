// const readline = require('readline')
// const { stdin: input, stdout: output } = require('process')

// const rl = readline.createInterface({ input, output })

import OpenAI from "openai";
import { createInterface } from 'readline/promises';
import { apiKey, baseURL } from './config.js'

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL
});

async function getResponse(messages) {
    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: messages,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        // console.error("Error fetching response:", error);
        throw error;  // 重新抛出异常以便上层处理
    }
}

// 初始化 messages
// const messages = [
//     {
//         "role": "system",
//         "content": `你是一名百炼手机商店的店员，你负责给用户推荐手机。手机有两个参数：屏幕尺寸（包括6.1英寸、6.5英寸、6.7英寸）、分辨率（包括2K、4K）。
//         你一次只能向用户提问一个参数。如果用户提供的信息不全，你需要反问他，让他提供没有提供的参数。如果参数收集完成，你要说：我已了解您的购买意向，请稍等。`,
//     }
// ];

// let assistant_output = "欢迎光临百炼手机商店，您需要购买什么尺寸的手机呢？";
// console.log(assistant_output);


// const readline = createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// (async () => {
//     while (!assistant_output.includes("我已了解您的购买意向")) {
//         const user_input = await readline.question("请输入：");
//         messages.push({ role: "user", content: user_input});
//         try {
//             const response = await getResponse(messages);
//             assistant_output = response;
//             messages.push({ role: "assistant", content: assistant_output });
//             console.log(assistant_output);
//             console.log("\n");
//         } catch (error) {
//             console.error("获取响应时发生错误:", error);
//         }
//     }
//     readline.close();
// })();

export {
  getResponse
}