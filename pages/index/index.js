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
    title: "众保营销小程序",
    showtime: true,
    //time: '',
    hour:0,
    minute:0,
    second:0,
    status: 0,
    //statusText: '您本月还没开始签到。',
    shareInfos: [],
    showModalStatus: false
  },
  timer: {},
  /*
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  */
  onLoad: function (options) {
    let that = this;

    wx.showShareMenu({
      withShareTicket: true //要求小程序返回分享目标信息
    })

    
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
        that.loginBz();    
        //return; 
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
            /*
            wx.navigateTo({
              url: '../sign/sign'
            })
            */
          } else {
            sessionid = '';
            console.log("获取sessionid失败");
          }
        }
      });
    }
    if (sessionid == '') {
      that.loginBz();
      //return; 
    }
    that.getSignInfo();
  },
  getSignInfo: function () {
    /**
     * 加载用户签到信息
     */ 
    let that = this;
    var infoJson = {
      url: config.signInfoUrl,
      data: {}, 
      cbSuccess: function (r) {
        console.log(r);
        if (r.code = '1200') {
          r.data.body = r.data.body || {};
          r.data.body.signStatus = r.data.body.signStatus || 0;
          // this.data.shareInfos = r.data.body.shareInfos||[]
          that.setData({
            status: r.data.body.signStatus,
            shareInfos: r.data.body.shareInfos || []
          });
        }
      }
    };
    util.selfRequest(infoJson);
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
              /*
              wx.navigateTo({
                url: '../sign/sign'
              })
              */ 
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
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let date; 
    this.timer = setInterval(function () {
      date = new Date();
      this.setData({
        hour: 24 - date.getHours() - 1, 
        minute: 60 - date.getMinutes(),   
        second: 60 - date.getSeconds() 
      });
      //this.setData({ time: util.formatTime(new Date()) });
    }.bind(this), 1000);   
  },
  /**
   * 签到前提醒
   */
  beforeShare: function (res) {
    var btnStatus = res.currentTarget.dataset.statu;
    this.diaLog(btnStatus);
  },
  afterShare: function (r) {
    let that = this;
    var infoJson = {
      url: config.signSignInUrl,
      data: {},
      cbSuccess: function (r) {
        console.log(r);
        if (r.code == '1200') {
          wx.showToast({
            title: '转发成功',
            duration: 5000
          })
        }
        that.getSignInfo();
      }
    }
    util.selfRequest(infoJson);

  },
  tipFinish: function (r) {
    wx.showToast({
      title: '今日已签到，明天再来吧！',
      duration: 5000
    })
  },
  diaLog: function (currentStatu) {
    /**
    * 弹窗动画
    */
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',//动画速度
      delay: 0
    })
    this.animationData = animation;//保存到当前页面

    animation.opacity(0).step();//执行动画并步进

    this.setData({ animationData: animation.export() });//保存上一组动画

    setTimeout(function () {
      //开始新的一组动画
      animation.opacity(1).step();
      this.setData({
        animationData: animation
      });
      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200);
    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  /**
   * 用户点击分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '众保推广送红包',
      path: '/page/index?id=123',
      success: function (res1) {
        console.log('确实分享' + res1.shareTickets);
        res1.shareTickets = res1.shareTickets || [];

        //ios 分享至个人无shareTickets
        if (res1.shareTickets.length == '') {
          wx.showToast({
            title: '请分享至聊天群',
            duration: 5000
          })
          return;
        }

        var shareTicket = res1.shareTickets[0];
        shareTicket = shareTicket || '';
        //android分享至个人，调用getShareInfo 将返回fail
        wx.getShareInfo({
          shareTicket: shareTicket,
          success: function (wxres) {
            console.log('success');
            console.log(wxres);
            //console.log(res);
            wx.showToast({
              title: '转发成功',
              duration: 5000
            })
            // util.selfRequest();
            var json = {
              "url": config.signShareUrl,
              data: {
                "encryptedData": wxres.encryptedData,
                "iv": wxres.iv
              },
              //敏感数据 encryptedData
              cbSuccess: function (encryptedData) {
                var msgResult = encryptedData.errMsg || '';
                if (msgResult.indexOf('ok') > 0) {
                  //刷新签到分享进度和签到进度
                  that.getSignInfo();
                }
              }
            };
            util.selfRequest(json);
          },
          fail: function (res) {
            // console.log('fail');
            // console.log(res);
            wx.showToast({
              title: '请分享至聊天群',
              duration: 5000
            })

            console.log('success');
          }
        });
      }
    }
  }
})
