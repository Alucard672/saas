// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 获取用户OpenID
    const openid = wxContext.OPENID
    
    // 检查用户是否已存在
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    if (userResult.data.length === 0) {
      // 新用户，创建用户记录
      const userInfo = {
        openid: openid,
        userInfo: {
          nickName: '用户',
          avatarUrl: ''
        },
        createTime: new Date(),
        updateTime: new Date()
      }
      
      await db.collection('users').add({
        data: userInfo
      })
    } else {
      // 更新用户信息
      await db.collection('users').where({
        openid: openid
      }).update({
        data: {
          updateTime: new Date()
        }
      })
    }
    
    return {
      success: true,
      openid: openid,
      message: '登录成功'
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 