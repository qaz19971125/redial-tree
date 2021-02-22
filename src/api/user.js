import http from './request'

export function login(data) {
  return http({
    url: '/login',
    method: 'post',
    data,
  })
}

export function getInfo(params) {
  return http({
    url: '/user-info',
    method: 'get',
    params,
  })
}

export function logout() {
  return http({
    url: '/logout',
    method: 'post',
  })
}
