const fetch = require('./axiosRequest')

function loginSubmit(params = {}) {
  return fetch({
    url: '?user/index/loginSubmit',
    method: 'get',
    params
  })
}

function getPath(params = {}) {
  return fetch({
    url: '/index.php?explorer/list',
    method: 'post',
    params
  })
}

module.exports = { loginSubmit, getPath };