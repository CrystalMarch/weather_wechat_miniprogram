// pages/weather/weather.js
var app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cur_id: app.cur_id,
    suggestion: "",
    // province: '',
    city: '',
    // district: '',
    latitude: '',
    longitude: '',
    week_weather_data: [],
    cur_day_weather_data:{},
    dayIndex: 0,
    day_list: {},
    locationFail: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: '' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
    });
    let that = this;
    that.getUserLocation()

    wx.showToast({
      title: 'Loading...',
      icon: 'loading',
      duration: 10000
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  getUserLocation: function () {
    let that = this
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        }
        else {
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },
  getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        var altitude = res.altitude
        that.getLocal(latitude, longitude)
      },
      fail: function (res) {
        that.setData({locationFail: true})
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  getLocal: function (latitude, longitude) {
    let that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        // console.log(JSON.stringify(res));
        // let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        // let district = res.result.ad_info.district
        console.log(res.result.ad_info)
        that.setData({
          // province: province,
          city: city,
          // district: district,
          latitude: latitude,
          longitude: longitude
        })
        app.globalData.locationCity = city
        // 定位成功以后获取 天气信息
        that.getWeatherInfo()
      },
      fail: function (res) {
        console.log(res);
        //定位失败 loading 消失
        wx.hideToast()
      },
      complete: function (res) {
        // console.log(res);
      }
    })
  },

  /*获取天气信息*/

  getWeatherInfo: function () {
    let that = this
    that.getnow(function (d, dayIndex) {
      wx.hideToast()
      let day_list = []
      for (let index in d) {
        day_list.push(d[index].day)
      }
      that.setData({ week_weather_data: d, cur_day_weather_data: d[dayIndex], day_list: day_list })//更新数据，视图将同步更新
    })
  },

  getnow: function (fn) {
    wx.request({
      url: 'https://www.tianqiapi.com/api/',
      header: { 'Content-Type': 'application/json' },
      data: { 'city': this.data.city.replace(/市/g, "") },
      success: function (res) {
        console.log(res);
        fn(res.data.data, 0);
      }
    })
  },

  /*绑定事件*/
  chooseCity: function () {
    wx.navigateTo({
      url: '../city/city?current_city',
    })
  },
  changeDay: function (e) {
    let that = this;
    let index = e.detail.value
    let cur_data = that.data.week_weather_data[index]
    this.setData({ dayIndex: index, cur_day_weather_data: cur_data})
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShdistrictppMessage: function () {

  }
})