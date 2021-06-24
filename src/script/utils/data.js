// 标准 "8路(水上派出所--尹集)"
// 其他形式的名字 "夜22路(解放桥(临时站)--中豪国际商贸城)"  "6路(19:00后)(解放桥--卧龙镇)"
export const getName = (name) => {
  const arr = name.split('(');
  let shortName = arr[0];
  if (arr.length > 2) {
    if (name.includes(')(')) {
      shortName = `${arr[0]}(${arr[1]}`;
    }
  }


  return shortName;
};

const getInterval = (name) => {
  const arr = name.split('(');

  let interval = arr[arr.length - 1].slice(0, -1);

  if (arr.length > 2 && !name.includes(')(')) {
    interval = arr.reduce((accumulator, currentValue, index) => {
      if (index === 1) {
        accumulator += `${currentValue}`;
      }

      if (index > 1) {
        accumulator += `(${currentValue}`;
      }

      return accumulator;
    }, '').slice(0, -1);
  }
  return interval;
};

/**
 * 经过某一个公交站点的数据整理
 * @param {Array} buslines
 */
export function busLinesArrange(buslines) {
  const shortNameArr = [];

  return buslines.reduce((accumulator, line) => {
    const { name } = line;
    const shortName = getName(name);
    const interval = getInterval(name);

    if (!name.includes('停运') && !shortNameArr.includes(shortName)) {
      line.shortName = shortName;
      line.interval = interval;
      shortNameArr.push(shortName);
      accumulator.push(line);
    }
    return accumulator;
  }, []);
}
