
/**
 * 创建  站点搜索 全部信息栏
 * @param {Array} data
 * @param {String} name 准确站点的名称
 */
export const createBusStopTitleHtml = (data, name = '') => {
  const { $ } = layui;
  const wrap = $('#map_result');

  wrap.html('');

  const lis = data.reduce((accumulator, {
    shortName,
    id,
  }, index) => {
    accumulator += `<a class="busLine-btn ${index ? '' : 'active'}" id="busLine_${id}" href="##">${shortName}</a>`;
    return accumulator;
  }, '');

  const dom = $(`
      <div class="result-title clearfix">
        <span class="icon iconfont icon-tishi fl"></span>
        <p>
        共有 <span style="text-decoration: underline;">${data.length}</span> 条公交线路经过 <span style="text-decoration: underline;">${name}</span> 。
        ${lis}
        </p>
      </div>
      `);

  wrap.append(dom);
};


/**
 * 创建每个公交信息的头部
 * @param {*} param0
 * @returns
 */
export const createBusStopTopHtml = ({
  shortName,
  interval,
  id,
}) => {
  const { $ } = layui;
  const wrap = $('#map_result');

  const dom = $(`
      <div class="one-line" id="busLine_detail_${id}">
        <div class="bus-excerpt mb15">
          <div class="excerpt fl">
            <div class="name">${shortName}</div>
            <div class="trip">${interval}</div>
          </div>
          <div class="other fr"><a title="${shortName}"  class="more">线路站点</a></div>
        </div>
        <div class="bus-lzlist mb15">
        </div>
      </div>
      `);

  wrap.append(dom);
  return dom.find('.bus-lzlist');
};

export const createBusStopCenterHtml = (wrap, data, currBusName) => {
  const { $ } = layui;

  const lineStation = data.via_stops;
  const busStopLi = lineStation.reduce((accumulator2, currentValue, index) => {
    if (index % 25 === 0) {
      accumulator2 += '<ol>';
    }
    accumulator2
        += `<li class="${currentValue.name === currBusName ? 'active' : ''}">
            <a href="#" id=${currentValue.id} title="${currentValue.name}" style="max-height: 170px;">${currentValue.name}</a></li>`;

    if (index % 25 === 24) {
      accumulator2 += '</ol>';
    }
    return accumulator2;
  }, '');

  wrap.append($(`<div>${busStopLi}</ol></div>`));
};

/**
   * 站点查询未查询到时，提示html
   * @param {*} busStopName
   */
export const createBusStopErrHtml = (busStopName) => {
  const { $ } = layui;
  const wrap = $('#map_result');
  const html = `<div class="cc-content">
        <div class="bus-plan error">
          <!-- <p>搜索“${busStopName}”结果：</p> -->
          <!-- <ul><li>没有 ${busStopName} 这个站点,请输入准确站点!</li></ul> -->
          <p class="error-title"><img class="icon" src="https://source.8684.cn/pcbus/assets/images/none.png"
              alt="">无法查询到该站点信息</p>
          <ul class="error-list">
            <li>没有查询到 <span class="error-name">${busStopName}</span> 这个站点，请输入准确的站点名称!</li>
          </ul>
        </div>
      </div>`;
  wrap.html(html);
};


/**
 * 创建  站点搜索 全部信息栏
 * @param {Array} data
 * @param {String} name 准确站点的名称
 */
export const createTransferTitleHtml = (plans) => {
  const { $ } = layui;
  const wrap = $('#map_result');

  wrap.html('');

  const lis = plans.reduce((accumulator, currentValue, index) => {
    accumulator += `<a class="transfer-btn ${index ? '' : 'active'}" id="transfer_${index}" href="##">方案${index + 1}</a>`;
    return accumulator;
  }, '');

  const dom = $(`
      <div class="result-title clearfix">
        <span class="icon iconfont icon-tishi fl"></span>
        <p>
        共有 <span style="text-decoration: underline;">${plans.length}</span> 种乘车方案。
        ${lis}
        </p>
      </div>
      `);

  wrap.append(dom);
};


export const createTransferHtml = ({ start, end }, plans) => {
  const { $ } = layui;
  const wrap = $('#map_result');
  const plansHtml = plans.reduce((accumulator, currentValue, index) => {
    const lis = currentValue.segments.reduce((accumulator2, currentValue2) => {
      if (currentValue2.transit_mode === 'WALK') {
        const [txt, busStopName] = currentValue2.instruction.split('到达');
        accumulator2 += `<li class="walk"><i class="iconfont iconwalk"></i><span>${txt} 至</span></li>`;
        if (busStopName) {
          accumulator2 += `<li class="site"><i class="iconfont iconbus1"></i><a href="#" title="${busStopName}">${busStopName}</a>`;
        }
      }

      if (currentValue2.transit_mode === 'BUS') {
        if (currentValue2.instruction.includes('途径')) {
          // eslint-disable-next-line no-unused-vars
          const [busLineName, a, stopNum, b, busStopName] = currentValue2.instruction.split(/['途径'|'到达']/);
          accumulator2 += `<li class="bus"><span><a href="#" title="${busLineName}">${busLineName}</a>途径 ${stopNum} </span></li>`;
          if (busStopName) {
            accumulator2 += `<li class="site"><i class="iconfont iconbus1"></i><a href="#" title="${busStopName}">${busStopName}</a>`;
          }
        }
      }

      return accumulator2;
    }, '');

    const busPlanHtml = `<div class="bus-plan" data-q="武昌火车站" data-q1="康福路楚平路">
      <div class="plan-head"><span class="plan-no">方案${index + 1}</span>
        <p>总行程${Math.round(currentValue.distance / 100) / 10}公里，乘车${Math.round(currentValue.transit_distance / 100) / 10}公里，步行${currentValue.walking_distance}米，全程约${Math.round(currentValue.time / 60)}分钟</p>
      </div>
      <ul class="plan-list2">
        <li class="site"><i class="iconfont iconstart"></i><a href="#" title="${start}">${start}</a>
        </li>
        ${lis}
        <li class="site end"><i class="iconfont iconend"></i><a href="#" title="${end}">${end}</a>
      </ul>
    </div>`;


    accumulator += busPlanHtml;

    return accumulator;
  }, '');

  wrap.append($(`<div class="tabs-item active">${plansHtml}</div>`));
};


/**
   * 换乘未查询到时，提示html
   * @param {*} busStopName
   */
export const createTransferErrHtml = ({ start, end }) => {
  const { $ } = layui;
  const wrap = $('#map_result');
  const html = `<div class="bus-plan error">
    <div class="noplan-tag"><span>${start}</span><i></i><span>${end}</span></div>
    <p class="error-title noplan-title">暂无换乘方案，也许是以下原因中的一个</p>
    <ol class="error-list noplan-list">
        <li>检查输入词是否有误，尝试其他的输入词</li>
        <li>也许是网络原因，请再次尝试</li>
    </ol>
  </div>`;
  wrap.html(html);
};
