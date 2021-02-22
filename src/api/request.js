import axios from 'axios'
import { Notification } from 'element-ui'
import { isDevelopment } from '@/utils/index'

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000,
})

const CancelToken = axios.CancelToken
const requests = []

function parseQuery(config) {
  const { method, params } = config
  // get参数编码
  if (method === 'get' && params) {
    let { url } = config
    if (url.indexOf('?') === -1) {
      url += '?'
    }
    for (const key in params) {
      url += `${key}=${encodeURIComponent(params[key])}&`
    }
    url = url.substring(0, url.length - 1) // 去除尾部&
    config.params = {}
    config.url = url
  }
}

function removeRequest(config) {
  const index = requests.findIndex((request) => {
    return request.url === config.url
  })
  if (index > -1) {
    return requests.splice(index, 1)[0]
  } else {
    return null
  }
}

// request interceptor
axiosInstance.interceptors.request.use(
  // modify config before send request
  (config) => {
    parseQuery(config)
    const request = removeRequest(config)
    if (request) {
      request.cancel(`重复的请求:${request.url}`) // 取消重复请求
    } else {
      config.cancelToken = new CancelToken((cancel) => {
        requests.push({
          url: config.url,
          cancel,
        })
      })
    }
    return config
  },
  (error) => {
    if (isDevelopment()) {
      console.log(error)
    }
    return Promise.reject(error)
  }
)

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const { data: res, config } = response
    removeRequest(config)
    if (Number(res.code) === 0) {
      Notification({
        title: '错误',
        message: res.msg || res.message || 'Error',
        type: 'error',
        duration: 3 * 1000,
        showClose: true,
      })
      return Promise.reject(new Error(res.msg || res.message || 'Error'))
    }

    return res
  },
  (error) => {
    const { config } = error
    removeRequest(config)
    if (isDevelopment()) {
      Notification({
        title: '错误',
        message: error.message,
        type: 'error',
        duration: 3 * 1000,
      })
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
