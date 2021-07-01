
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
      type: '公交', // 兴趣点类别
      pageSize: 10, // 单页显示结果条数
      pageIndex: 1, // 页码
      city: '襄阳', // 兴趣点城市
      citylimit: true, // 是否强制限制在设置的城市内搜索
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

    this.placeSearchBus = new AMap.PlaceSearch({
      type: '公交',
      pageSize: 10,
      pageIndex: 1,
      city: '襄阳',
    });
  }


  /**
   * 根据名称 查询经过站点的 公交数据
   * @param {*} type
   * @param {*} value
   * @param {Function} cb
   */
  searchStation(value, cb = () => {}) {
    this.stationSearch.search(value, (status, result) => {
      console.log('站点数据1', result);

      if (status === 'complete' && result.stationInfo.length > 0) {
        // 过滤枣阳等数据
        const stationInfo = [];
        const adcodeArr = ['420602', '420606', '420607'];
        result.stationInfo.forEach((item) => {
          if (adcodeArr.includes(item.adcode)) {
            stationInfo.push(item);
          }
        });

        result.stationInfo = stationInfo;
        cb(status, result);
      } else {
        cb(status, result);
      }
      console.log('站点数据2', result);
    });
  }

  /**
   * 在限定区域内 查询站点
   * @param {*} value
   * @param {*} cb
   */
  searchStationByBounds(value, cb = () => {}) {
    this.placeSearchBus.searchInBounds(value, globalConfig.polygonArr, (status, result) => {
      cb(status, result);
      console.log('区域站点数据', result);
    });
  }

  /**
   * 根据站点id 查询经过站点的 公交数据
   * @param {*} type
   * @param {*} value
   * @param {Function} cb
   */
  searchStationById(id, cb = () => {}) {
    this.stationSearch.searchById(id, (status, result) => {
      cb(status, result);
      console.log('站点数据', result);
    });
  }

  /**
   * 根据关键词 查询襄阳市区数据数据
   * @param {*} keyword
   * @param {*} cb
   */
  searchPlace(keyword, cb = () => {}) {
    this.placeSearch.searchInBounds(keyword, globalConfig.polygonArr, (status, result) => {
      // 搜索成功时，result即是对应的匹配数据
      console.log(result);
      cb(status, result);
    });
  }


  /**
   * 根据起始结束的名称查询公交换乘线路
   * @param {*} param0
   * @param {*} cb
   */
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

  /**
   * 根据起始结束的经纬度 查询公交换乘线路
   * @param {*} param0
   * @param {*} cb
   */
  searchTransferByLngLat({ start, end }, cb) {
    this.transferSearch.search(
      new AMap.LngLat(start.lng, start.lat),
      new AMap.LngLat(end.lng, end.lat),
      (status, result) => {
        transferArr = result;

        if (cb) {
          cb(status, result);
        }

        console.log('换乘数据', result);
      },
    );
  }


  lineSearchByName(line, cb = () => {}) {
    this.lineSearch.search(line, (status, result) => {
      if (status === 'complete' && result.lineInfo.length > 0) {
        // 过滤枣阳等数据
        const lineInfo = [];
        const reg = /(宜城|谷城|南漳|保康|枣阳|老河口)+/;
        result.lineInfo.forEach((item) => {
          if (reg.test(item.name) || reg.test(item.company)) {
            // ineInfo.push(item);
          } else {
            lineInfo.push(item);
          }
        });

        result.lineInfo = lineInfo;
        cb(status, result);
      } else {
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
