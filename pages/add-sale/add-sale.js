// pages/add-sale/add-sale.js
const app = getApp()

Page({
  data: {
    isEdit: false,
    orderId: '',
    orderNo: '',
    customer: '',
    paymentMethods: ['微信支付', '支付宝', '现金', '银行卡'],
    paymentMethodIndex: 0,
    selectedProducts: [],
    totalQuantity: 0,
    totalAmount: 0
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        orderId: options.id
      })
      this.loadOrderData(options.id)
    } else {
      this.generateOrderNo()
    }
  },

  // 生成订单号
  generateOrderNo: function () {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const orderNo = `SO${year}${month}${day}${random}`
    
    this.setData({ orderNo })
  },

  // 加载订单数据（编辑模式）
  loadOrderData: function (id) {
    wx.showLoading({ title: '加载中...' })
    
    // 模拟数据
    const mockOrder = {
      orderNo: 'SO20240125001',
      customer: '张三',
      paymentMethod: '微信支付',
      products: [
        {
          id: 1,
          name: '苹果手机壳',
          emoji: '📱',
          price: 99,
          quantity: 2,
          stock: 50
        },
        {
          id: 2,
          name: '无线充电器',
          emoji: '🔋',
          price: 101,
          quantity: 1,
          stock: 30
        }
      ]
    }

    setTimeout(() => {
      const paymentMethodIndex = this.data.paymentMethods.indexOf(mockOrder.paymentMethod)
      this.setData({
        orderNo: mockOrder.orderNo,
        customer: mockOrder.customer,
        paymentMethodIndex: paymentMethodIndex >= 0 ? paymentMethodIndex : 0,
        selectedProducts: mockOrder.products
      })
      this.calculateTotal()
      wx.hideLoading()
    }, 1000)
  },

  // 客户姓名输入
  onCustomerInput: function (e) {
    this.setData({ customer: e.detail.value })
  },

  // 支付方式选择
  onPaymentMethodChange: function (e) {
    this.setData({ paymentMethodIndex: e.detail.value })
  },

  // 添加商品
  addProduct: function () {
    wx.navigateTo({
      url: '/pages/product-select/product-select',
      events: {
        selectProduct: (product) => {
          this.addProductToList(product)
        }
      }
    })
  },

  // 添加商品到列表
  addProductToList: function (product) {
    const existingIndex = this.data.selectedProducts.findIndex(p => p.id === product.id)
    
    if (existingIndex >= 0) {
      // 如果商品已存在，增加数量
      const products = [...this.data.selectedProducts]
      products[existingIndex].quantity += 1
      this.setData({ selectedProducts: products })
    } else {
      // 添加新商品
      const newProduct = {
        ...product,
        quantity: 1
      }
      this.setData({
        selectedProducts: [...this.data.selectedProducts, newProduct]
      })
    }
    
    this.calculateTotal()
  },

  // 增加商品数量
  increaseQuantity: function (e) {
    const index = e.currentTarget.dataset.index
    const products = [...this.data.selectedProducts]
    
    if (products[index].quantity < products[index].stock) {
      products[index].quantity += 1
      this.setData({ selectedProducts: products })
      this.calculateTotal()
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'error'
      })
    }
  },

  // 减少商品数量
  decreaseQuantity: function (e) {
    const index = e.currentTarget.dataset.index
    const products = [...this.data.selectedProducts]
    
    if (products[index].quantity > 1) {
      products[index].quantity -= 1
      this.setData({ selectedProducts: products })
      this.calculateTotal()
    } else {
      this.removeProduct(e)
    }
  },

  // 移除商品
  removeProduct: function (e) {
    const index = e.currentTarget.dataset.index
    const products = [...this.data.selectedProducts]
    products.splice(index, 1)
    this.setData({ selectedProducts: products })
    this.calculateTotal()
  },

  // 计算总额
  calculateTotal: function () {
    let totalQuantity = 0
    let totalAmount = 0
    
    this.data.selectedProducts.forEach(product => {
      totalQuantity += product.quantity
      totalAmount += product.price * product.quantity
    })
    
    this.setData({
      totalQuantity,
      totalAmount
    })
  },

  // 验证表单
  validateForm: function () {
    if (!this.data.customer.trim()) {
      wx.showToast({
        title: '请输入客户姓名',
        icon: 'error'
      })
      return false
    }
    
    if (this.data.selectedProducts.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'error'
      })
      return false
    }
    
    return true
  },

  // 保存订单
  saveOrder: function () {
    if (!this.validateForm()) return
    
    wx.showLoading({ title: '保存中...' })
    
    const orderData = {
      orderNo: this.data.orderNo,
      customer: this.data.customer,
      paymentMethod: this.data.paymentMethods[this.data.paymentMethodIndex],
      totalAmount: this.data.totalAmount,
      products: this.data.selectedProducts
    }
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: this.data.isEdit ? '更新成功' : '创建成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack()
  }
})