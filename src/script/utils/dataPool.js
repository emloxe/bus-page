/**
 * 根据id存储的公交线路数据
 */
const lineObj = {};

/**
 * 根据id查询公交线路数据
 * @param {String} id
 * @returns
 */
export const getLineDataById = (id) => {
  if (lineObj[id]) {
    return {
      code: 1,
      line: lineObj[id],
    };
  }

  // 数据向sessionStorage存后，取出来重置map视图会有问题
  // const line = JSON.parse(sessionStorage.getItem(id));

  // if (line) {
  //   lineObj[id] = line;
  //   return {
  //     code: 1,
  //     line,
  //   };
  // }

  return {
    code: 0,
  };
};

export const setLineDataById = (id, line) => {
  lineObj[id] = line;
  sessionStorage.setItem(id, JSON.stringify(line));
};
