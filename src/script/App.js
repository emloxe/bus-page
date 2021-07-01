import Map from './Map';
import Hint from './Hint';

import {
  busLinesArrange, getName,
  createBusLineTitleHtml, createBusLineErrHtml,
  createBusStopTitleHtml, createBusStopTopHtml, createBusStopCenterHtml, createBusStopErrHtml,
  createTransferHtml, createTransferErrHtml, createTransferTitleHtml,
} from './utils/index';


// eslint-disable-next-line no-unused-vars
let busStopVal = null;
let startVal = null;
let endVal = null;

class App {
  constructor() {
    this.init();
  }

  init() {
    this.mapInstance = new Map();
    this.addEvent();
    this.showChangeLine();
    this.closeSpinner();
  }

  // 关闭loading
  closeSpinner() {
    setTimeout(() => {
      document.querySelector('#spinner-div').style.display = 'none';
    }, 1000);
  }

  addEvent() {
    const { $ } = layui;

    const startInpt = $('#search_transfer_inpt1');
    const endInpt = $('#search_transfer_inpt2');

    // 点击起始和目的变更
    $('#change_direction').on('click', () => {
      const a = startInpt.val();
      const b = endInpt.val();
      startInpt.val(b);
      endInpt.val(a);

      if (startVal && endVal) {
        const c = startVal;
        startVal = endVal;
        endVal = c;
      }
    });


    // 点击公交站点
    $('#map_result').on('click', '.bus-id', (e) => {
      const id = $(e.currentTarget).attr('id');
      this.searchBusStopHandler('id', id, () => {
      });
    });


    this.addBusLineEvent();
    this.addBusStopEvent();
    this.addTransferEvent();

    this.addChangePlaneEvent();
    this.addSearchHintEvent();
  }


  addBusLineEvent() {
    const { $ } = layui;
    let btn1canUse = true;
    const btn1 = $('#search_busLine_btn');
    const busLineInpt = $('#search_busLine_inpt');

    btn1.on('click', () => {
      if (!btn1canUse) {
        return;
      }
      btn1.addClass('layui-btn-disabled');
      btn1canUse = false;

      const value = busLineInpt.val();
      if (!value.trim()) {
        layui.layer.msg('输入无效');
        return;
      }

      this.searchBusLineHandler(value, () => {
        btn1canUse = true;
        btn1.removeClass('layui-btn-disabled');
      });
    });
  }


  // 站点查询按钮监听
  addBusStopEvent() {
    const { $ } = layui;
    let btn1canUse = true;
    const btn1 = $('#search_busStop_btn');
    const busStopInpt = $('#search_busStop_inpt');


    btn1.on('click', () => {
      if (!btn1canUse) {
        return;
      }
      btn1.addClass('layui-btn-disabled');
      btn1canUse = false;

      if (busStopVal) {
        this.searchBusStopHandler('id', busStopVal.id, () => {
          btn1canUse = true;
          btn1.removeClass('layui-btn-disabled');
        });
      } else {
        const value = busStopInpt.val();
        if (!value.trim()) {
          layui.layer.msg('输入无效');
          return;
        }

        this.searchBusStopHandler('name', value, () => {
          btn1canUse = true;
          btn1.removeClass('layui-btn-disabled');
        });
      }
    });
  }


  // 公交线路查询按钮监听
  addTransferEvent() {
    const { $ } = layui;
    let btn2canUse = true;
    const btn2 = $('#search_navigationRoute_btn');

    const startInpt = $('#search_transfer_inpt1');
    const endInpt = $('#search_transfer_inpt2');

    // 点击路线查询
    btn2.on('click', () => {
      if (!btn2canUse) {
        return;
      }
      btn2.addClass('layui-btn-disabled');
      btn2canUse = false;

      if (startVal && endVal) {
        this.searchTransferHandler('lngLat', { start: startVal.location, end: endVal.location }, () => {
          btn2canUse = true;
          btn2.removeClass('layui-btn-disabled');
        });
      } else {
        const start = startInpt.val();
        const end = endInpt.val();
        if (!start.trim() && !start.trim()) {
          layui.layer.msg('输入无效');
          return;
        }
        this.searchTransferHandler('name', { start, end }, () => {
          btn2canUse = true;
          btn2.removeClass('layui-btn-disabled');
        });
      }
    });
  }

  // 切换方案监听
  addChangePlaneEvent() {
    const { $ } = layui;

    // eslint-disable-next-line func-names
    $('#map_result').on('click', '.busLine-btn', (e) => {
      const a = $(e.currentTarget);

      if (!a.hasClass('active')) {
        const id = a.attr('id').split('_')[1];

        // 高亮显示按钮
        a.parent().find('.active').removeClass('active');
        a.addClass('active');

        // 把点击的list放置在最前面
        $(`busLine_detail_${id}`).insertBefore($(`busLine_detail_${id}`).parent().first());

        this.mapInstance.drawBusLineById(id);
      }
    });

    // eslint-disable-next-line func-names
    $('#map_result').on('click', '.transfer-btn', (e) => {
      const a = $(e.currentTarget);

      if (!a.hasClass('active')) {
        a.parent().find('.active').removeClass('active');
        this.mapInstance.drawTransferByIndex(a.attr('id').split('_')[1]);
        a.addClass('active');
      }
    });
  }

  // 搜索提示监听
  addSearchHintEvent() {
    const { $ } = layui;

    const busStopInpt = $('#search_busStop_inpt');
    const startInpt = $('#search_transfer_inpt1');
    const endInpt = $('#search_transfer_inpt2');

    if (globalConfig.searchHint) {
      // 公交站搜索提示
      const busStopHint = new Hint($('#busStop_hint'), (data) => {
        busStopInpt.val(data.name.split('(')[0]);
        busStopVal = data;
      });
      busStopInpt.on('input', (e) => {
        busStopVal = null;
        this.busStopSearchHintHandler(busStopHint, $(e.currentTarget).val());
      });

      // 起始搜索提示
      const startHint = new Hint($('#start_hint'), (data) => {
        startInpt.val(data.name);
        startVal = data;
      });
      startInpt.on('input', (e) => {
        startVal = null;
        this.transferHintHandler(startHint, $(e.currentTarget).val());
      });

      // 结束搜索提示
      const endHint = new Hint($('#end_hint'), (data) => {
        endInpt.val(data.name);
        endVal = data;
      });
      endInpt.on('input', (e) => {
        endVal = null;
        this.transferHintHandler(endHint, $(e.currentTarget).val());
      });
    }
  }


  searchBusLineHandler(iptValue, cb = () => {}) {
    const handler = (status, result) => {
      if (status === 'complete' && result.lineInfo.length > 0) {
        const lineArr = busLinesArrange(result.lineInfo);
        const nameArr = lineArr.map(({ shortName }) => shortName);
        this.showChangeLine([...new Set(nameArr)]);

        createBusLineTitleHtml(lineArr);
        lineArr.forEach((line, index) => {
          const wrap = createBusStopTopHtml(line);
          createBusStopCenterHtml(wrap, line, null);
        });
        this.mapInstance.drawBusLine(lineArr[0]);
      } else {
        createBusLineErrHtml(layui.$('#search_busLine_inpt').val());
      }

      cb();
    };


    this.mapInstance.lineSearchByName(iptValue, (status, result) => {
      handler(status, result);
    });
  }


  /**
   * 根据公交站点 查询公交线路
   * @param {String} type [name, id]
   * @param {*} value
   * @param {*} cb
   */
  searchBusStopHandler(type, iptValue, cb = () => {}) {
    const handler = (status, result) => {
      if (status === 'complete' && result.stationInfo.length > 0) {
        const lineArr = busLinesArrange(result.stationInfo[0].buslines);
        const busName = getName(result.stationInfo[0].name);
        createBusStopTitleHtml(lineArr, busName);

        const nameArr = lineArr.map(({ shortName }) => shortName);
        this.showChangeLine(nameArr);

        lineArr.forEach((line, index) => {
          const wrap = createBusStopTopHtml(line);
          this.mapInstance.lineSearchById(line.id, (status2, result2) => {
            if (status2 === 'complete') {
              createBusStopCenterHtml(wrap, result2.lineInfo[0], busName);
            }
            if (index === 0) {
              this.mapInstance.drawBusLine(result2.lineInfo[0]);
            }
          });
        });
      } else {
        createBusStopErrHtml(layui.$('#search_busStop_inpt').val());
      }

      cb();
    };

    if (type === 'id') {
      this.mapInstance.searchStationById(iptValue, (status, result) => {
        handler(status, result);
      });
    } else {
      this.mapInstance.searchStation(iptValue, (status, result) => {
        handler(status, result);
      });
    }
  }


  /**
   * 根据公交站点 查询公交线路
   * @param {*} value
   * @param {*} cb
   */
  searchTransferHandler(type, { start, end }, cb = () => {}) {
    const startInpt = layui.$('#search_transfer_inpt1');
    const endInpt = layui.$('#search_transfer_inpt2');

    const handler = (status, result) => {
      if (status === 'complete' && result.plans) {
        const nameArr = result.plans.reduce((arr1, { segments }) => {
          arr1.push(...segments.reduce((arr2,
            // eslint-disable-next-line camelcase
            { instruction, transit_mode }) => {
            // eslint-disable-next-line camelcase
            if (transit_mode === 'BUS') {
              arr2.push(instruction.split('(')[0].slice(2));
            }

            return arr2;
          }, []));
          return arr1;
        }, []);
        this.showChangeLine(nameArr);

        this.mapInstance.drawTransferByIndex(0);
        createTransferTitleHtml(result.plans);
        createTransferHtml({ start: startInpt.val(), end: endInpt.val() }, result.plans);
      } else {
        createTransferErrHtml({ start: startInpt.val(), end: endInpt.val() });
      }

      cb();
    };

    if (type === 'lngLat') {
      this.mapInstance.searchTransferByLngLat({ start, end }, (status, result) => {
        handler(status, result);
      });
    } else {
      this.mapInstance.searchTransfer({ start, end }, (status, result) => {
        handler(status, result);
      });
    }
  }

  busStopSearchHintHandler(hintInstance, val) {
    if (!val.trim()) {
      hintInstance.hide();
      return;
    }
    this.mapInstance.searchStationByBounds(val, (status, result) => {
      console.log('busStopSearchHintHandler', result);
      if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
        hintInstance.show(result.poiList.pois);
      } else {
        hintInstance.noResult();
      }
    });
  }

  transferHintHandler(hintInstance, val) {
    if (!val.trim()) {
      hintInstance.hide();
      return;
    }
    this.mapInstance.searchPlace(val, (status, result) => {
      if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
        hintInstance.show(result.poiList.pois);
      } else {
        hintInstance.noResult();
      }
    });
  }


  showChangeLine(arr) {
    const { $ } = layui;

    const htmlRander = curr => `<div class="one">
      <div class="clearfix"><h5 class="fl">${curr.busName}</h5> <span class="fr"> ${curr.startTime} <i class="start">起</i>   ${curr.endTime ? `|  ${curr.endTime} <i>止</i>` : ''}</span></div>
      <p> ${curr.changeInfo}</p>
    </div>`;

    // $('#changeLine_wrap').html();

    if (!arr) {
      $.ajax({
        url: `${globalConfig.busChange}`,
        type: 'get',
        success(result) {
          if (!result.code && result.data.length > 0) {
            const html = result.data.reduce((all, curr, index) => {
              if (index < globalConfig.maxBusChangeNum) {
                all += htmlRander(curr);
              }
              return all;
            }, '');
            $('#changeLine_wrap').html(html);
          } else {
            $('#changeLine_wrap').html('<p>暂无维修线路</p>');
          }
        },
      });
    } else {
      // // eslint-disable-next-line no-unused-vars
      let isChang = 0;
      arr.forEach((str) => {
        $.ajax({
          url: `${globalConfig.busChange}?busName=${str}`,
          type: 'get',
          success(result) {
            if (!result.code && result.data.length > 0) {
              const html = result.data.reduce((all, curr, index) => {
                if (index < globalConfig.maxBusChangeNum) {
                  all += htmlRander(curr);
                }
                return all;
              }, '');
              if (!isChang) {
                $('#changeLine_wrap').html('');
                isChang = 1;
              }
              $('#changeLine_wrap').append(html);
            }
          },

        });
      });
    }
  }
}
export default App;
