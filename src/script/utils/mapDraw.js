

/* 绘制路线 */
function drawbusLine(startPot, endPot, BusArr) {
  const nodeArr = [];


  // 创建一个 Icon
  const startIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: './static/images/mapicon.png',
    imageSize: new AMap.Size(135, 40),
    imageOffset: new AMap.Pixel(-9, -3),
  });
  // 绘制起点，终点
  nodeArr.push(new AMap.Marker({
    position: startPot, // 基点位置
    icon: startIcon,
    zIndex: 10,
  }));


  // 创建一个 icon
  const endIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: './static/images/mapicon.png',
    imageSize: new AMap.Size(135, 40),
    imageOffset: new AMap.Pixel(-95, -3),
  });

  nodeArr.push(new AMap.Marker({
    position: endPot, // 基点位置
    icon: endIcon,
    zIndex: 10,
  }));
  // 绘制乘车的路线
  nodeArr.push(new AMap.Polyline({
    path: BusArr,

    strokeColor: '#09f', // 线颜色
    strokeOpacity: 0.8, // 线透明度
    isOutline: true,
    outlineColor: 'white',
    strokeWeight: 6, // 线宽
  }));


  return nodeArr;
}

/* 公交路线查询服务返回数据解析概况 */
export function getBusLineNode(line) {
  const pathArr = line.path;
  const stops = line.via_stops;
  const startPot = stops[0].location;
  const endPot = stops[stops.length - 1].location;
  return drawbusLine(startPot, endPot, pathArr);
}


export function getTransferNode(line) {
  const nodeArr = [];


  for (let i = 0, l = line.segments.length; i < l; i += 1) {
    const segment = line.segments[i];

    // 绘制步行路线
    if (segment.transit_mode === 'WALK') {
      const line2 = new AMap.Polyline({
        path: segment.transit.path,
        isOutline: true,
        outlineColor: 'white',
        borderWeight: 1,
        strokeWeight: 5,
        strokeColor: 'grey',
        lineJoin: 'round',
        strokeStyle: 'dashed',
      });

      nodeArr.push(line2);
    } else if (segment.transit_mode === 'SUBWAY' || segment.transit_mode === 'BUS') {
      const line3 = new AMap.Polyline({
        path: segment.transit.path,
        isOutline: true,
        outlineColor: 'white',
        borderWeight: 2,
        strokeWeight: 5,
        strokeColor: '#0091ff',
        lineJoin: 'round',
        strokeStyle: 'solid',
      });

      nodeArr.push(line3);
    } else {
      // 其它transit_mode的情况如RAILWAY、TAXI等，没有绘制
    }
  }


  const needDrawArr = {};

  // eslint-disable-next-line camelcase
  line.segments.forEach(({ transit, transit_mode }, index) => {
    // eslint-disable-next-line camelcase
    if (transit_mode === 'BUS') {
      needDrawArr[transit.off_station.name] = transit.off_station.location;
      needDrawArr[transit.on_station.name] = transit.on_station.location;
    }
  });


  Object.values(needDrawArr).forEach((location) => {
    // 创建一个 Icon
    const busIcon = new AMap.Icon({
      size: new AMap.Size(30, 34),
      image: './static/images/mapicon.png',
      imageSize: new AMap.Size(135, 40),
      imageOffset: new AMap.Pixel(-56, 5),
      zIndex: 20,
    });

    const marker = new AMap.Marker({
      position: location, // 基点位置
      icon: busIcon,
      // anchor: 'bottom-center',
      zIndex: 10,
    });

    // marker.setLabel({
    //   direction: 'top',
    //   offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
    //   content: "<div style='border-color: #afafaf;'>我是 marker 的 label 标签</div>", // 设置文本标注内容
    // });

    nodeArr.push(marker);
  });


  // 创建一个 Icon
  const startIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: './static/images/mapicon.png',
    imageSize: new AMap.Size(135, 40),
    imageOffset: new AMap.Pixel(-9, -3),
    zIndex: 30,
  });
  // 绘制起点，终点
  nodeArr.push(new AMap.Marker({
    position: line.path[0], // 基点位置
    icon: startIcon,
    zIndex: 10,
  }));


  // 创建一个 icon
  const endIcon = new AMap.Icon({
    size: new AMap.Size(25, 34),
    image: './static/images/mapicon.png',
    imageSize: new AMap.Size(135, 40),
    imageOffset: new AMap.Pixel(-95, -3),
    zIndex: 30,
  });

  nodeArr.push(new AMap.Marker({
    position: line.path[line.path.length - 1], // 基点位置
    icon: endIcon,
    zIndex: 10,
  }));

  return nodeArr;
}
