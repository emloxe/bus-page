import Map from './Map';
import Hint from './Hint';

import {
  busLinesArrange, getName,
  createBusStopTitleHtml, createBusStopTopHtml, createBusStopCenterHtml, createBusStopErrHtml,
  createTransferHtml, createTransferErrHtml, createTransferTitleHtml,
} from './utils/index';


let busStopVal = null;
// eslint-disable-next-line no-unused-vars
let startVal = null;
// eslint-disable-next-line no-unused-vars
let endVal = null;

class App {
  constructor() {
    this.init();
  }

  init() {
    this.mapInstance = new Map();
    this.addEvent();
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
    // eslint-disable-next-line
    let btn1canUse = true;
    let btn2canUse = true;
    const btn1 = $('#search_busStop_btn');
    const btn2 = $('#search_navigationRoute_btn');

    const busStopInpt = $('#search_busStop_inpt');
    const startInpt = $('#search_transfer_inpt1');
    const endInpt = $('#search_transfer_inpt2');

    // 站点查询按钮
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


    // 点击路线查询
    btn2.on('click', () => {
      if (!btn2canUse) {
        return;
      }
      btn2.addClass('layui-btn-disabled');
      btn2canUse = false;
      const start = startInpt.val();
      const end = endInpt.val();
      if (!start.trim() && !start.trim()) {
        layui.layer.msg('输入无效');
        return;
      }
      this.searchTransferHandler({ start, end }, () => {
        btn2canUse = true;
        btn2.removeClass('layui-btn-disabled');
      });
    });

    // 搜索提示
    if (globalConfig.searchHint) {
      // 公交站搜索提示
      const busStopHint = new Hint($('#busStop_hint'), (data) => {
        console.log('提示被点击', data);
        busStopInpt.val(data.name.split('(')[0]);
        busStopVal = data;
      });
      busStopInpt.on('input', (e) => {
        busStopVal = null;
        this.busStopSearchHintHandler(busStopHint, $(e.currentTarget).val());
      });

      // 起始搜索提示
      const startHint = new Hint($('#start_hint'), (data) => {
        console.log('提示被点击', data);
        startInpt.val(data.name);
        startVal = data;
      });
      startInpt.on('input', (e) => {
        startVal = null;
        this.transferHintHandler(startHint, $(e.currentTarget).val());
      });

      // 结束搜索提示
      const endHint = new Hint($('#end_hint'), (data) => {
        console.log('提示被点击', data);
        endInpt.val(data.name);
        endVal = data;
      });
      endInpt.on('input', (e) => {
        endVal = null;
        this.transferHintHandler(endHint, $(e.currentTarget).val());
      });
    }


    // 点击起始和目的变更
    $('#hange_direction').on('click', () => {

    });

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

  /**
   * 根据公交站点 查询公交线路
   * @param {*} value
   * @param {*} cb
   */
  searchBusStopHandler(type, iptValue, cb = () => {}) {
    const handler = (status, result) => {
      if (status === 'complete' && result.stationInfo.length > 0) {
        const lineArr = busLinesArrange(result.stationInfo[0].buslines);
        const busName = getName(result.stationInfo[0].name);
        createBusStopTitleHtml(lineArr, busName);

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
        createBusStopErrHtml(iptValue);
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
  searchTransferHandler({ start, end }, cb = () => {}) {
    this.mapInstance.searchTransfer({ start, end }, (status, result) => {
      if (status === 'complete' && result.plans) {
        this.mapInstance.drawTransferByIndex(0);
        createTransferTitleHtml(result.plans);
        createTransferHtml({ start: result.originName, end: result.destinationName }, result.plans);
      } else {
        createTransferErrHtml({ start, end });
      }

      cb();
    });
  }

  busStopSearchHintHandler(hintInstance, val) {
    if (!val.trim()) {
      hintInstance.hide();
      return;
    }
    this.mapInstance.searchStation(val, (status, result) => {
      if (status === 'complete' && result.stationInfo.length > 0) {
        console.log('处理提示', result.stationInfo);
        hintInstance.show(result.stationInfo);
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
        console.log('处理提示', result.poiList.pois);
        hintInstance.show(result.poiList.pois);
      } else {
        hintInstance.noResult();
      }
    });
  }
}
export default App;
