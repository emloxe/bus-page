
import {
  getBusLineNode, getLineDataById, setLineDataById, getTransferNode,
} from './utils/index';


// eslint-disable-next-line no-unused-vars
let transferArr = [];

export default class Map {
  constructor() {
    this.init();
  }

  init() {
    // eslint-disable-next-line no-unused-vars
    const map = new AMap.Map('map_wrap', {
      resizeEnable: true,
      center: [112.128604, 32.015228],
      zoom: 11,
    });

    this.map = map;

    this.initSearch();
  }


  initSearch() {
    // 站点查询
    this.stationSearch = new AMap.StationSearch({
      pageIndex: 1,
      pageSize: 10,
      city: '襄阳',
    });

    // 公交线路查询
    this.lineSearch = new AMap.LineSearch({
      pageIndex: 1,
      pageSize: 10,
      city: '襄阳',
      extensions: 'all',
    });

    // 换乘查询
    this.transferSearch = new AMap.Transfer({
      city: '襄阳',
      extensions: 'all',
      // panel: document.querySelector('#panel'),
      // policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
    });

    // 地点搜索提示
    this.placeSearch = new AMap.PlaceSearch({
      city: '襄阳',
    });
  }

  /**
   * 查询经过站点的 公交数据
   * @param {*} type 可选类型有 id ，name
   * @param {*} value
   * @param {Function} cb
   */
  searchStation(value, cb = () => {}) {
    this.stationSearch.search(value, (status, result) => {
      cb(status, result);
      console.log('站点数据', result);
    });
  }


  searchStationById(id, cb = () => {}) {
    this.stationSearch.searchById(id, (status, result) => {
      cb(status, result);
      console.log('站点数据', result);
    });
  }

  searchPlace(keyword, cb = () => {}) {
    this.placeSearch.search(keyword, (status, result) => {
      // 搜索成功时，result即是对应的匹配数据
      console.log(result);
      cb(status, result);
    });
  }


  searchTransfer({ start, end }, cb) {
    this.transferSearch.search([
      {
        keyword: start,
        city: '襄阳',
      },
      {
        keyword: end,
        city: '襄阳',
      },
    ], (status, result) => {
      transferArr = result;

      if (cb) {
        cb(status, result);
      }

      console.log('换乘数据', result);
    });
  }


  lineSearchByName(line, cb) {
    this.lineSearch.search(line, (status, result) => {
      if (cb) {
        cb(status, result);
      }
      console.log('公交数据', result);
    });
  }

  /**
   * 根据公交线路ID查询公交详情
   * @param {String} id
   * @param {Function} cb
   */
  lineSearchById(id, cb) {
    // 本地数据缓存处理

    if (cb) {
      const { code, line } = getLineDataById(id);

      if (code) {
        cb('complete', line);
        return;
      }

      this.lineSearch.searchById(id, (status, result) => {
        if (status === 'complete') {
          setLineDataById(id, result);
        }

        cb(status, result);
        console.log('公交线路数据', result);
      });
    }
  }

  drawBusLine(line) {
    const { map } = this;
    const nodeArr = getBusLineNode(line);
    map.clearMap();
    map.add(nodeArr);
    map.setFitView();
  }

  drawBusLineById(id) {
    const { code, line } = getLineDataById(id);

    if (code) {
      this.drawBusLine(line.lineInfo[0]);
    }
  }


  drawTransferByIndex(index) {
    this.drawTransfer(transferArr.plans[index]);
  }


  drawTransfer(line) {
    const { map } = this;
    const nodeArr = getTransferNode(line);
    map.clearMap();
    map.add(nodeArr);
    map.setFitView();
  }
}
