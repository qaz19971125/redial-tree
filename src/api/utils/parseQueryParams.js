/**
 * 处理查询参数
 * @param {object} params - 查询参数
 * @returns {object} params - 转化后的参数
 */
export default function parseQueryParams(params) {
  for (const key in params) {
    if (Array.isArray(params[key])) {
      // 该查询条件为数组（条件有多个值）时，处理成字符串
      // 若为空数组，删除该条件
      if (params[key].length > 0) {
        params[key] = params[key].join(',')
      } else {
        delete params[key]
      }
    } else {
      if (params[key] === '') {
        delete params[key]
      }
    }
  }
  return params
}
