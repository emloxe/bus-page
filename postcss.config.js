//postcss.config.js 
module.exports = { 
  plugins: [ 
    require("autoprefixer")({    // 浏览器加前缀
     /*...options*/
      broswers: [
        "defaults",
        "not ie < 11",
        "last 7 versions",
        "> 1%",
        "iOS 7",
        "last 3 iOS versions"
      ]
    })
  ] 
}
