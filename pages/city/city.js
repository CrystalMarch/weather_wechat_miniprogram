// pages/city/city.js
import citys from './json'

var app = getApp();

const hotCode = ['310100', '110100', '310000', '440100', '440300', '320100']

Page({

  /**
   * 页面的初始数据
   */
  data: {
    citys: [],
    hotCitys: [],
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z','#'],
    scrollIntoId: '',
    currentLetter: '',
    letterHeight: 18,
    startPageY: 0,
    timer: null,
    showSearch: false,
    searchResult: [],
    current_city: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let citys = that.getLetterCity()
    let hotCitys = that.getHotCity()
    console.log(citys)
    that.setData({ citys: citys, hotCitys: hotCitys, current_city: app.globalData.locationCity})
    wx.setNavigationBarTitle({
      title: '选择城市'  //修改title
    })
  },
  
  getLetterCity: function () {
    let tempObj = []
    for (let i = 0; i < this.data.letters.length; i++) {
      let letter = this.data.letters[i]
      let cityInfo = []
      let tempArr = {}
      tempArr.letter = letter
      for (let j = 0; j < citys.length; j++) {
        if (letter == citys[j].letter) {
          cityInfo.push(citys[j])
        }
      }
      tempArr.cityInfo = cityInfo
      tempObj.push(tempArr)
    }
    return tempObj
  },
  getHotCity: function () {
    const cityInfo = []
    for (let item of citys) {
      if (hotCode.indexOf(item.code) !== -1) {
        cityInfo.push(item)
      }
    }
    this.data.letters.unshift('#')
    return cityInfo.sort((a, b) => a.code > b.code)
  },
  
  /*绑定事件 */

  onListTouchStart: function ({ currentTarget, touches }) {
    const letter = currentTarget.dataset.letter
    this.onLetterTaped(letter)
    this.setData({ startPageY: touches[0].pageY})
  },
  onListTouchMove: function ({ currentTarget, touches }) {
    const letter = currentTarget.dataset.letter
    const index = this.data.letters.indexOf(letter)
    const pageY = touches[0].pageY
    let dist = ~~(Math.abs(this.data.startPageY - pageY) / this.data.letterHeight)
    let isUp = false
    if (this.data.startPageY - pageY > 0) {
      isUp = true
    }
    if (dist) {
      let i = isUp ? index - dist : index + dist
      i < 0 && (i = 0)
      i > this.data.letters.length - 1 && (i = this.data.letters.length - 1)
      this.onLetterTaped(this.data.letters[i])
    }
  },
  onListTouchEnd: function () {
    let that = this;
    if (that.data.timer) {
      clearTimeout(that.timer)
    }
    that.timer = setTimeout(() => {
      clearTimeout(that.data.timer)
      let currentLetter = ''
      let timer = null
      that.setData({currentLetter: currentLetter, timer: timer})
    }, 750)
  },

  onFocus: function () {
    this.setData({showSearch: true})
  },
  hideSearchResult: function() {
    this.setData({ showSearch: false })
  },
  onInput: function ({ detail: { value } }) {
    let that = this;
    if (!value.trim()) {
      return []
    }
    const reg = new RegExp(value, 'ig')
    // console.log(value)
    let searchResult = citys.filter(i => {
      return reg.test(i.name) || reg.test(i.search)
    })
    that.setData({ searchResult: searchResult, showSearch: true})
  },
  onSelected: function (event) {
    console.log(event)
    let city = event.currentTarget.dataset.city
    console.log('已选择城市', city.name)
    wx.showToast({
      title: city.name
    })
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({ city: city.name, dayIndex: 0})
    prevPage.getWeatherInfo()
    wx.navigateBack({
      
    })
  },
  onLocationTaped: function () {

    console.log('已选择定位的城市', this.data.current_city)
    wx.showToast({
      title: this.data.current_city
    })
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({ city: this.data.current_city, dayIndex: 0 })
    prevPage.getWeatherInfo()
    wx.navigateBack({

    })
  },

  onLetterTaped: function (letter) {
    let scrollIntoId = letter === '#' ? 'top' : letter
    let currentLetter = letter
    this.setData({ currentLetter: currentLetter, scrollIntoId: scrollIntoId })
  }
})