//index.js
//获取应用实例
var util = require('../../utils/util.js')
var config = require('../../config.js')
const app = getApp()

Page({
  data: {
    motto: '欢迎使用天天签到',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    //for test 
    // wx.navigateTo({
    //   url: '../share/share',
    // })
    wx.showShareMenu({
      //如果是他人分享过来的
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,

        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: function (res) {
          app.globalData.userInfo = res.userInfo;
        }
      })
    }
    /**
     * 确认sessionKey是否有效
     */
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效

      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        loginBz();  
        return; 
      }
    });
    var sessionid = wx.getStorageSync(config.session_key_name) || '';
    if (sessionid != '') {
      util.selfRequest({
        url: config.authenUrl,
        data: { 'ds_session_id': sessionid },
        cbSuccess: function (r) {
          //会话有效
          if (r.data.code == '1200') {
            wx.navigateTo({
              url: '../sign/sign'
            })
          } else {
            sessionid = '';
          }
        }
      });
    }
    if (sessionid == '') {
      wx.login({
        success: function (res) {
          var json = {
            url: config.loginUrl,
            data: { "code": res.code },
            cbSuccess: function (r) {
              console.log(r.data.code + ";" + r.data.msg + ";" + r.data.body);
              if (r.data.code == '1200') {
                wx.setStorageSync('ds_session_id', r.data.body)
                wx.navigateTo({
                  url: '../sign/sign'
                }) 
              }
            }
          } 
          util.selfRequest(json);
        }
      })
    }
    // wx.navigateTo({
    //   url: '../sign/sign',
    // })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  /**
   * 确认用户登录时应以微信的sessionKey为主，
   * sessionKey无效，则需调用 wx.login
   * 获取最新的code再进行业务逻辑里的登录操作
   * 业务登录调用
   */
  loginBz: function () {
    wx.login({
      success: function (res) {
        var json = {
          url: config.loginUrl,
          data: { "code": res.code },
          cbSuccess: function (r) {
            console.log(r.data.code + ";" + r.data.msg + ";" + r.data.body);
            if (r.data.code == '1200') {
              wx.setStorage({
                key: 'ds_session_id',
                data: r.data.body
              })
              wx.navigateTo({
                url: '../sign/sign'
              }) 
            }
          }
        }
        util.selfRequest(json);
      }
    })
  },
  /**
   * 获取用户号码callback
   */
  cbGetphone: function (res) {

    console.log(res.detail.errMsg);
    console.log(res.detail.iv);
    console.log(res.detail.encryptedData);
    if (!res.errMsg) {

    }
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {

    }
    return {
      title: '有好友邀请你来签到',
      path: 'index.wxml'
    }
  }
})
