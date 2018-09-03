/**
 * 类数组集合转数组
 * @param { object } arrayLikeObj - 类数组集合
 * @return { array }
 */
function convertArrayLikeObjToArray(arrayLikeObj) {
  return Array.prototype.slice.call(arrayLikeObj)
}

/**
 * 清空表单元素值
 * @param { array } formElements - 表单元素
 */
function clearFormElementsValue(formElements) {
  for (let i = 0; i < convertArrayLikeObjToArray(formElements).length; i += 1) {
    const formElement = formElements[i]
    const defaultValue = formElement.getAttribute('data-default')

    if (defaultValue) {
      formElement.value = defaultValue
    } else {
      formElement.value = ''
    }

    // checkbox
    if (formElement.type === 'checkbox') {
      formElement.checked = false
      formElement.parentNode.className = 'checkbox checkbox-unselected'
    }
  }
}

/**
 * 获取将要删除的元素
 * @param { array } items - 类数组集合
 * @param { string } key - 筛选关键字
 * @return { array }
 */
function getItemsWillDelete(items, key) {
  const result = []

  for (let i = 0; i < convertArrayLikeObjToArray(items).length; i += 1) {
    const item = items[i]

    result.push(item.getAttribute(key))
  }

  return result
}

/**
 * 格式化小数
 * @param { value } string - 需要格式化的值
 * @return { string }
 */
function formateToDecimal(value) {

  // 不能输入非数字，除了小数点
  value = value.replace(/[^\\.\d]/g, '')

  // 不能输入第二个小数点
  const dots = value.match(/\./g)

  if (dots) {
    if (dots.length > 1) {
      value = value.replace(/(\.)[^\\.]*$/, function (matched, item) {
        return matched.replace(item, '')
      })
    }
  }

  // 小数点不能在第一位
  if (value[0] === '.') {
    value = value.replace('.', '')
  }

  // 不能出现 '0*' 的情况
  if (value[0] === '0' && value[1] !== '.') {
    value = value.replace(value[1], '')
  }

  // 小数点后不能超过 2 位
  const decimal = value.match(/\.(\d*)/)
  if (decimal) {
    if (decimal[1].length > 2) {
      value = value.slice(0, -(decimal[1].length - 2))
    }
  }

  // 整数位不能大于 10 位
  const integer = value.match(/(\d*)/)

  if (integer && integer[1] && integer[1].length > 10) {
    value = integer[1].slice(0, 10)
  }

  return value
}

/**
 * 格式化折扣
 * @param { value } string - 需要格式化的值
 * @return { string }
 */
function formateToDiscount(value) {
  // 不能输入非数字，除了小数点
  value = value.replace(/[^\\.\d]/g, '')
  // 不能输入第二个小数点
  const dots = value.match(/\./g)
  if (dots) {
    if (dots.length > 1) {
      value = value.replace(/\.$/, '')
    }
  }
  // 小数点不能在第一位
  if (value[0] === '.') {
    value = value.replace('.', '')
  }
  // 第一位不能是 0
  // if (value[0] === '0') {
  //   value = value.replace('0', '')
  // }
  // 不能出现 '0*' 的情况
  if (value[0] === '0' && value[1] !== '.') {
    value = value.replace(value[1], '')
  }
  // 小数点后不能超过 2 位
  const decimal = value.match(/\.(\d*)/)
  if (decimal) {
    if (decimal[1].length > 2) {
      value = value.slice(0, -(decimal[1].length - 2))
    }
  }
  // 整数位不能大于 1 位
  const integer = value.match(/(\d*)/)

  if (integer && integer[1] && integer[1] > 10) {
    value = 10
  }

  return value
}

/**
 * 格式化整数
 * @param { value } string - 需要格式化的值
 * @return { string }
 */

function formateToInteger(value) {
  return value.replace(/[^\d]/, '')
}

/**
 * 判断整数
 * @param { value } string - 整数字符串
 * @return { boolean }
 */
function isInteger(value) {
  return /^\d*$/.test(value)
}

/**
 * 获取小数位长度
 * @param { value } string - 小数字符串
 * @return { boolean }
 */
function getDecimalCount(value) {
  const decimal = value.split('.')
  let count = 0

  if (decimal) {
    count = decimal[1].length
  }

  return count
}

export default {
  convertArrayLikeObjToArray,
  clearFormElementsValue,
  getItemsWillDelete,
  formateToDecimal,
  isInteger,
  getDecimalCount,
  formateToInteger,
  formateToDiscount
}
