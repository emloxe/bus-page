export default class Hint {
  constructor(wrap, clickCallBack = () => {}) {
    this.wrap = wrap;
    this.clickCallBack = clickCallBack;
    this.data = [];

    this.addEvent();
  }


  addEvent() {
    this.wrap.on('click', 'li', (e) => {
      const index = layui.$(e.currentTarget).index();
      this.clickCallBack(this.data[index]);

      this.hide();
    });

    this.wrap.on('mouseenter', (e) => {
      const activeDom = this.wrap.find('.active');
      if (activeDom.length > 0) {
        activeDom.removeClass('active');
      }
    });

    document.body.addEventListener('click', () => {
      this.hide();
    });

    this.wrap.parent().on('keydown', (e) => {
      //  "ArrowUp" "ArrowDown" "Enter"

      if (e.key === 'ArrowDown') {
        const activeDom = this.wrap.find('.active');
        if (activeDom.length === 0) {
          const liDom = this.wrap.find('li');
          if (liDom.length > 0) {
            liDom.first().addClass('active');
          }
        } else {
          const nextDom = activeDom.next();
          if (nextDom.length > 0) {
            activeDom.removeClass('active');
            nextDom.addClass('active');
          }
        }
      }

      if (e.key === 'ArrowUp') {
        const activeDom = this.wrap.find('.active');
        if (activeDom.length === 0) {
          const liDom = this.wrap.find('li');
          if (liDom.length > 0) {
            liDom.first().addClass('active');
          }
        } else {
          const nextDom = activeDom.prev();
          if (nextDom.length > 0) {
            activeDom.removeClass('active');
            nextDom.addClass('active');
          }
        }
      }

      if (e.key === 'Enter') {
        const activeDom = this.wrap.find('.active');
        if (activeDom) {
          this.clickCallBack(this.data[activeDom.index()]);
          this.hide();
        }
      }

      e.stopPropagation();
    });
  }

  show(stationInfo) {
    this.data = stationInfo;
    const lis = stationInfo.reduce((accumulator, current) => {
      accumulator += `<li>${current.name}${current.address ? `  <span style="font-size: 12px">【${current.address}】<span>` : ''}</li>`;
      return accumulator;
    }, '');
    this.wrap.html(`<ul>${lis}</ul>`);
  }

  hide() {
    this.wrap.html('');
  }

  noResult() {
    this.wrap.html('<ul><p>无数据</p></ul>');
  }
}
