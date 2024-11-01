import { getResponse } from '../until/chat.js'
import express from 'express'
import db from '../sql/connectDB.js'

const router = express.Router()

router.get('/', function(req, res, next) {
  res.send('respond with a resource -- chat')
})

// messages: [
//   {"role": "system", "content": "You are a helpful assistant."},
//   {"role": "user", "content": "你是谁？"}
// ],
router.post('/question', async (req, res) => {
  const { messages } = req.body

  const param = [{
    "role": "system", "content": "You are a helpful assistant."
  }]
  // param.push({
  //   role: "user",
  //   content: messages
  // })
  if (messages && messages.length) {
    messages.map((item) => {
      param.push({
        role: "user",
        content: item
      })
    })
  }

  const data = await getResponse(param)

  res.success({ data })

})


// module.exports = router
export default router

