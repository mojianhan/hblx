/* global XMLHttpRequest localStorage HOST */

const xhr = new XMLHttpRequest()

function buildParam(prefix, obj, add) {
  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      if (/\[\]$/.test(prefix)) {
        add(prefix, value)
      } else {
        buildParam(prefix + '[' + (typeof value === 'object' && value != null ? index : '') + ']', value, add)
      }
    })
  } else if (typeof obj === 'object') {
    for (const name in obj) {
      buildParam(prefix + '[' + name + ']', obj[name], add)
    }
  } else {
    add(prefix, obj)
  }
}

function formatParam(data) {
  const s = []

  if (Array.isArray(data)) {
    data.forEach((value, key) => {
      add(key, value)
    })
  } else {
    for (const prefix in data) {
      buildParam(prefix, data[prefix], add)
    }
  }

  function add(key, valueOfFunction) {
    const value = typeof valueOfFunction === 'function' ? valueOfFunction() : valueOfFunction
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value == null ? '' : value)
  }

  return s.join('&')
}

function isFormData(object) {
  return Object.prototype.toString.call(object) === '[object FormData]'
}

function ajax({ url = '', method = 'GET', data = {} } = {}) {

  if (HOST) {
    url = HOST + url
  }

  // data.token = localStorage.getItem('9DAYE_MOBILE_CRM_TOKEN')

  method === 'GET' && (url += '?' + formatParam(data))

  return new Promise(resolve => {
    xhr.open(method, url)

    if (method === 'POST') {
      if (!isFormData(data)) {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      }
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve(xhr)
      }
    }

    method === 'GET' ? xhr.send(null) : xhr.send(formatParam(data))
  })
}

export default ajax
