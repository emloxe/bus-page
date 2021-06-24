import '../style/rest.css';
import '../style/base.less';
import '../style/copy.css';
import '../style/index.less';


import App from './App';


AMap.plugin(['AMap.StationSearch', 'AMap.LineSearch', 'AMap.Transfer'], () => { // 异步同时加载多个插件
  const app = new App();
  window.app = app;
});
