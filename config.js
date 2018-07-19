/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：${protocol}www.qcloud.com/solution/la
var protocol = "http://"
var host2 = "fatrabbit.free.ngrok.cc/"
var host1 = "localhost:8080"
var host = "193.112.0.99/DailySign/"
var config = {
    session_key_name:'ds_session_id',
    title:'微信营销小程序',
    // 下面的地址配合云端 Server 工作
    host,

    // 登录接口，用于建立会话
    loginUrl: `${protocol}${host}/user/login`,
    authenUrl:`${protocol}${host}/user/authentic`,
    // 签到相关接口
    signInfoUrl: `${protocol}${host}/sign/info`,
    signShareIfnoUrl: `${protocol}${host}/sign/shareInfo`,
    signShareUrl:`${protocol}${host}/sign/share`,
    signSignInUrl:`${protocol}${host}/sign/signIn`,
    // 测试的请求地址，用于测试会话
    requestUrl: `${protocol}${host}/testRequest`,
    // 用code换取openId
    openIdUrl: `${protocol}${host}/openid`,

    // 测试的信道服务接口
    tunnelUrl: `${protocol}${host}/tunnel`,

    // 生成支付订单的接口
    paymentUrl: `${protocol}${host}/payment`,

    // 发送模板消息接口
    templateMessageUrl: `${protocol}${host}/templateMessage`,

    // 上传文件接口
    uploadFileUrl: `${protocol}${host}/upload`,

    // 下载示例图片接口
    downloadExampleUrl: `${protocol}${host}/static/weapp.jpg`
};

/**
 * 业务请求相应状态码
 */
var rspCode = {
  success:'1200',
  //请求方问题
  failReq:'1400',
  //服务端问题
  failSrv:'1500'
}
module.exports = config
