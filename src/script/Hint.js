export default class Hint {
  constructor(wrap, clickCallBack = () => {}) {
    this.wrap = wrap;
    this.clickCallBack = clickCallBack;
    this.data = [];

    this.addEvent();
  }


  addEvent() {
    this.wrap.on('click', 'li', (e) => {
      console.log(e);
      const index = layui.$(e.currentTarget).index();
      this.clickCallBack(this.data[index]);

      this.hide();
    });

    document.body.onclick = () => {
      this.hide();
    };
  }

  show(stationInfo) {
    this.data = stationInfo;
    const lis = stationInfo.reduce((accumulator, current) => {
      accumulator += `<li>${current.name}</li>`;
      return accumulator;
    }, '');
    this.wrap.html(`<ul>${lis}</ul>`);
  }

  hide() {
    this.wrap.html('');
  }

  noResult() {
    this.wrap.html('<ul><span>无数据</span></ul>');
  }
}
