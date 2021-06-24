import Map from './Map';

import {
  busLinesArrange, getName,
  createBusStopTitleHtml, createBusStopTopHtml, createBusStopCenterHtml, createBusStopErrHtml,
  createTransferHtml, createTransferErrHtml, createTransferTitleHtml,
} from './utils/index';

class App {
  constructor() {
    this.init();
  }

  init() {
    this.mapInstance = new Map();
    this.addEvent();
    this.closeSpinner();
  }

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

    // 站点查询按钮
    btn1.on('click', () => {
      if (!btn1canUse) {
        return;
      }
      const ipt = $('#search_busStop_inpt');
      btn1.addClass('layui-btn-disabled');
      btn1canUse = false;
      const value = ipt.val();
      if (!value.trim()) {
        layui.layer.msg('输入无效');
        return;
      }
      this.searchBusStopHandler(value, () => {
        btn1canUse = true;
        btn1.removeClass('layui-btn-disabled');
      });
    });

    btn2.on('click', () => {
      if (!btn2canUse) {
        return;
      }
      btn2.addClass('layui-btn-disabled');
      btn2canUse = false;
      const start = $('#search_transfer_inpt1').val();
      const end = $('#search_transfer_inpt2').val();
      if (!start.trim() && !start.trim()) {
        layui.layer.msg('输入无效');
        return;
      }
      this.searchTransferHandler({ start, end }, () => {
        btn2canUse = true;
        btn2.removeClass('layui-btn-disabled');
      });
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
  searchBusStopHandler(iptValue, cb) {
    this.mapInstance.searchStation(iptValue, (status, result) => {
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

      if (cb) {
        cb();
      }
    });
  }


  /**
   * 根据公交站点 查询公交线路
   * @param {*} value
   * @param {*} cb
   */
  searchTransferHandler({ start, end }, cb) {
    this.mapInstance.searchTransfer({ start, end }, (status, result) => {
      if (status === 'complete' && result.plans) {
        this.mapInstance.drawTransferByIndex(0);
        createTransferTitleHtml(result.plans);
        createTransferHtml({ start: result.originName, end: result.destinationName }, result.plans);
      } else {
        createTransferErrHtml({ start, end });
      }


      if (cb) {
        cb();
      }
    });
  }
}
export default App;
