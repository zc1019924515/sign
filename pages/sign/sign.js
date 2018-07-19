// pages/sign/sign.js
var util = require ('../../utils/util.js')
var config = require('../../config.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title:"众保营销小程序",
    showtime:true,
    time: '',
    status:0,
    statusText:'您本月还没开始签到。',
    shareInfos:[],
    showModalStatus: false
  },
  timer: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showShareMenu({
      withShareTicket: true //要求小程序返回分享目标信息
    })
     
     /**
      * 加载签到和分享信息
      */
     that.getSignInfo();
    //  that.getShareInfo();
  },
  getSignInfo: function(){
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
            shareInfos: r.data.body.shareInfos||[]
          });
        }
      }
    };
    util.selfRequest(infoJson);
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.timer = setInterval(function () {
      this.setData ({ time: util.formatTime(new Date()) });
    }.bind(this), 1000);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
      clearInterval(this.data.timer);
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
   * 签到前提醒
   */
  beforeShare:function(res){
    //内部提醒样式
    // wx.showModal({
    //   title: '打卡领红包',
    //   content: '将'+this.data.title+'分享至五个群才可以签到哦',
    //   confirmText: "去去就来",
    //   cancelText: "残忍拒绝",
    //   success: function (res) {
    //     console.log(res);
    //     if (res.confirm) {
           
    //     } else {

    //     }
    //   }
    // })

    var btnStatus = res.currentTarget.dataset.statu;
    this.diaLog(btnStatus);
  },
  afterShare:function(r){
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
  tipFinish:function(r){
    wx.showToast({
      title: '今日已签到，明天再来吧！',
      duration: 5000
    })
  },
  diaLog: function (currentStatu){
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
      success:function(res1){
        console.log('确实分享'+res1.shareTickets);
        res1.shareTickets = res1.shareTickets||[];

        //ios 分享至个人无shareTickets
        if (res1.shareTickets.length==''){
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
              data: { "encryptedData":wxres.encryptedData,
                      "iv":wxres.iv},
              //敏感数据 encryptedData
              cbSuccess: function (encryptedData) {
                var msgResult = encryptedData.errMsg||'';
                if(msgResult.indexOf('ok')>0){
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