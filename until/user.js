// const fetch = require('./axiosRequest')
import fetch from './axiosRequest.js'

function loginSubmit(params = {}) {
  return fetch({
    url: '?user/index/loginSubmit',
    method: 'get',
    params
  })
}

function getPath(data = {}) {
  return fetch({
    url: '/index.php?explorer/list',
    method: 'post',
    data
  })
}

// module.exports = { loginSubmit, getPath };
export { loginSubmit, getPath }