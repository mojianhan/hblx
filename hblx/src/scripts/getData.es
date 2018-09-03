/* global location */

import weui from 'weui'
import ajax from './ajax'

async function getData(data) {
  const loading = weui.loading('加载中')
  const res = await ajax(data)
  const result = JSON.parse(res.responseText)

  // weui.alert 必须在上一个同类元素的 hide() 回调中使用
  loading.hide(() => {
    const alertConfig = {
      className: 'crm-weui-component',
      isAndroid: false
    }

    switch (res.status) {
      case 403:
        alertConfig.buttons = [
          {
            label: '重新登录',
            type: 'default',
            onClick: () => {
              location.href = './login.html'
            }
          }
        ]

        weui.alert(result.data.errMsg, alertConfig)
        break

      case 404:
        weui.alert('接口去火星旅游了')
        break

      case 500:
        weui.alert('后端哥哥代码出错了')
        break

      case 504:
        weui.alert('OMG！服务器被偷了')
        break

      // no default
    }
  })

  return result
}

export default getData
