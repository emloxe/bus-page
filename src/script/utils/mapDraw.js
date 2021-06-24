

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
  console.log(line);

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
  });

  nodeArr.push(new AMap.Marker({
    position: line.path[line.path.length - 1], // 基点位置
    icon: endIcon,
    zIndex: 10,
  }));


  nodeArr.push(new AMap.Polyline({
    path: line.path,
    strokeColor: '#09f', // 线颜色
    strokeOpacity: 0.8, // 线透明度
    isOutline: true,
    outlineColor: 'white',
    strokeWeight: 6, // 线宽
  }));

  line.segments.forEach((item) => {
    if (item.transit_mode === 'BUS') {
      if (item.transit.via_stops[0]) {
        // 创建一个 Icon
        const busIcon = new AMap.Icon({
          size: new AMap.Size(25, 34),
          image: './static/images/mapicon.png',
          imageSize: new AMap.Size(135, 40),
          imageOffset: new AMap.Pixel(-52, -3),
        });

        const marker = new AMap.Marker({
          position: item.transit.via_stops[0].location, // 基点位置
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
      }
    }
  });

  return nodeArr;
}
