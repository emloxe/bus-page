/**
 * @name isString
 * @function
 * @description 判断目标函数是不是字符串
 * @param {String} o 字符串
 */
export const isString = o => Object.prototype.toString.call(o) === '[object String]';


/**
 * @name isArray
 * @function
 * @description 判断传入的对象是不是数组
 * @param {Array} o 数组
 */
export const isArray = o => Object.prototype.toString.call(o) === '[object Array]';


export const getTime = (second) => {
  const minute = Math.round(second / 60);

  if (minute > 60) {
    return `${Math.floor(minute / 60)}小时${minute % 60}分钟`;
  }

  return `${minute}分钟`;
};
