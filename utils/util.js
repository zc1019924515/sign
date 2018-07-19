const formatTime = date => {
  // const year = date.getFullYear()
  // const month = date.getMonth() + 1
  // const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [hour, minute, second].map(formatNumber).join(':')
}
const examinePhone =function(phone){
  var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
  if (!phoneReg.test(phone)) {
    return false;
  }  
}
const formatNumber = function(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
 
function selfRequest(json) {
      //业务请求前带上sessionid，注意不要让业务请求中的参数名取'ds_session_id'
      var value = wx.getStorageSync('ds_session_id')||'';
  
      json.data.ds_session_id = value;
      
      wx.request({
        url:  json.url,
        data: json.data,
        header:{"content-type":
        "application/json;charset=utf-8;"
        },
        success: function (r) {
          if (r.data.code == '1200') {
            json.cbSuccess(r);
            //前端请求问题
          } if (r.data.code == '1500') {
            json.cbFail(r);
            //server 问题
          } else {
           
            console.log('problem from front');
          }
        }
      }) 
  
      var pages = getCurrentPages()
      console.log(pages[pages.length-1].route+'请求出现问题');
     
}
module.exports = {
  formatTime: formatTime,
  examinePhone: examinePhone,
  selfRequest: selfRequest
}
