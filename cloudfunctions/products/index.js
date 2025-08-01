// cloudfunctions/products/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, openid, product, productId, page = 0, pageSize = 20, category = '', keyword = '' } = event
  
  try {
    switch (action) {
      case 'add':
        return await addProduct(openid, product)
      case 'update':
        return await updateProduct(openid, productId, product)
      case 'delete':
        return await deleteProduct(openid, productId)
      case 'list':
        return await getProductList(openid, page, pageSize, category, keyword)
      case 'detail':
        return await getProductDetail(openid, productId)
      case 'count':
        return await getProductCount(openid)
      case 'lowStockCount':
        return await getLowStockCount(openid)
      case 'lowStockProducts':
        return await getLowStockProducts(openid)
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('商品操作失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 添加商品
async function addProduct(openid, product) {
  const productData = {
    ...product,
    openid,
    createTime: new Date(),
    updateTime: new Date(),
    deleted: false
  }
  
  const result = await db.collection('products').add({
    data: productData
  })
  
  return {
    success: true,
    productId: result._id,
    message: '添加成功'
  }
}

// 更新商品
async function updateProduct(openid, productId, product) {
  const updateData = {
    ...product,
    updateTime: new Date()
  }
  
  await db.collection('products').where({
    _id: productId,
    openid: openid
  }).update({
    data: updateData
  })
  
  return {
    success: true,
    message: '更新成功'
  }
}

// 删除商品（软删除）
async function deleteProduct(openid, productId) {
  await db.collection('products').where({
    _id: productId,
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

// 获取商品列表
async function getProductList(openid, page, pageSize, category, keyword) {
  let query = {
    openid: openid,
    deleted: false
  }
  
  // 分类筛选
  if (category) {
    query.category = category
  }
  
  // 关键词搜索
  if (keyword) {
    query.$or = [
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { sku: db.RegExp({ regexp: keyword, options: 'i' }) }
    ]
  }
  
  const result = await db.collection('products')
    .where(query)
    .orderBy('createTime', 'desc')
    .skip(page * pageSize)
    .limit(pageSize)
    .get()
  
  return {
    success: true,
    products: result.data
  }
}

// 获取商品详情
async function getProductDetail(openid, productId) {
  const result = await db.collection('products').where({
    _id: productId,
    openid: openid,
    deleted: false
  }).get()
  
  return {
    success: true,
    product: result.data[0] || null
  }
}

// 获取商品总数
async function getProductCount(openid) {
  const result = await db.collection('products').where({
    openid: openid,
    deleted: false
  }).count()
  
  return {
    success: true,
    total: result.total
  }
}

// 获取低库存数量
async function getLowStockCount(openid) {
  const result = await db.collection('products').where({
    openid: openid,
    deleted: false,
    stock: db.command.lte(db.command.field('minStock'))
  }).count()
  
  return {
    success: true,
    count: result.total
  }
}

// 获取低库存商品
async function getLowStockProducts(openid) {
  const result = await db.collection('products').where({
    openid: openid,
    deleted: false,
    stock: db.command.lte(db.command.field('minStock'))
  }).orderBy('stock', 'asc').limit(10).get()
  
  return {
    success: true,
    products: result.data
  }
} 