// const axios = require('axios')
import axios from "axios"

const serverAddress = 'http://stage.ezkit.net:12180/'
const instanceAxios = axios.create()

const fetch = async ({
  method = 'get',
  url,
  params,
}) => {
  let option = {
    method,
    url: `${serverAddress}${url}`,
    params
  }
  try {
    let result = await instanceAxios.request(option)
    return result
  } catch(err) {
    return err
  }
}

// module.exports = fetch;
export default fetch