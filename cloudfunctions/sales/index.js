// cloudfunctions/sales/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, openid, sale, saleId, page = 0, pageSize = 20 } = event
  
  try {
    switch (action) {
      case 'add':
        return await addSale(openid, sale)
      case 'update':
        return await updateSale(openid, saleId, sale)
      case 'delete':
        return await deleteSale(openid, saleId)
      case 'list':
        return await getSaleList(openid, page, pageSize)
      case 'detail':
        return await getSaleDetail(openid, saleId)
      case 'todayCount':
        return await getTodayCount(openid)
      case 'monthlyRevenue':
        return await getMonthlyRevenue(openid)
      case 'recentActivities':
        return await getRecentActivities(openid)
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('销售操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 添加销售订单
async function addSale(openid, sale) {
  const transaction = await db.startTransaction()
  
  try {
    // 生成订单号
    const orderNo = generateOrderNo()
    
    // 创建销售订单
    const saleData = {
      ...sale,
      openid,
      orderNo,
      status: 'completed',
      createTime: new Date(),
      updateTime: new Date(),
      deleted: false
    }
    
    const saleResult = await transaction.collection('sales').add({
      data: saleData
    })
    
    // 更新商品库存
    for (const item of sale.items) {
      await transaction.collection('products').where({
        _id: item.productId,
        openid: openid
      }).update({
        data: {
          stock: db.command.inc(-item.quantity),
          updateTime: new Date()
        }
      })
    }
    
    await transaction.commit()
    
    return {
      success: true,
      saleId: saleResult._id,
      orderNo: orderNo,
      message: '订单创建成功'
    }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

// 更新销售订单
async function updateSale(openid, saleId, sale) {
  const updateData = {
    ...sale,
    updateTime: new Date()
  }
  
  await db.collection('sales').where({
    _id: saleId,
    openid: openid
  }).update({
    data: updateData
  })
  
  return {
    success: true,
    message: '更新成功'
  }
}

// 删除销售订单（软删除）
async function deleteSale(openid, saleId) {
  await db.collection('sales').where({
    _id: saleId,
    openid: openid
  }).update({
    data: {
      deleted: true,
      updateTime: new Date()
    }
  })
  
  return {
    success: true,
    message: '删除成功'
  }
}

// 获取销售订单列表
async function getSaleList(openid, page, pageSize) {
  const result = await db.collection('sales')
    .where({
      openid: openid,
      deleted: false
    })
    .orderBy('createTime', 'desc')
    .skip(page * pageSize)
    .limit(pageSize)
    .get()
  
  return {
    success: true,
    sales: result.data
  }
}

// 获取销售订单详情
async function getSaleDetail(openid, saleId) {
  const result = await db.collection('sales').where({
    _id: saleId,
    openid: openid,
    deleted: false
  }).get()
  
  return {
    success: true,
    sale: result.data[0] || null
  }
}

// 获取今日订单数量
async function getTodayCount(openid) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const result = await db.collection('sales').where({
    openid: openid,
    deleted: false,
    createTime: db.command.gte(today)
  }).count()
  
  return {
    success: true,
    count: result.total
  }
}

// 获取本月收入
async function getMonthlyRevenue(openid) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const result = await db.collection('sales').aggregate()
    .match({
      openid: openid,
      deleted: false,
      createTime: db.command.gte(startOfMonth)
    })
    .group({
      _id: null,
      totalRevenue: db.command.sum('$totalAmount')
    })
    .end()
  
  return {
    success: true,
    revenue: result.list[0]?.totalRevenue || 0
  }
}

// 获取最近活动
async function getRecentActivities(openid) {
  const result = await db.collection('sales')
    .where({
      openid: openid,
      deleted: false
    })
    .orderBy('createTime', 'desc')
    .limit(5)
    .get()
  
  const activities = result.data.map(sale => ({
    id: sale._id,
    icon: '🛒',
    text: `销售订单 ${sale.orderNo}`,
    time: formatTime(sale.createTime)
  }))
  
  return {
    success: true,
    activities: activities
  }
}

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  
  return `SO${year}${month}${day}${hour}${minute}${second}${random}`
}

// 格式化时间
function formatTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${Math.floor(diff / 86400000)}天前`
  }
} 