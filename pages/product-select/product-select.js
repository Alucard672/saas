// pages/product-select/product-select.js
Page({
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    products: [
      {
        id: 1,
        name: '苹果 iPhone 15',
        code: 'IP15001',
        category: '手机',
        emoji: '📱',
        price: 5999,
        stock: 25,
        unit: '台'
      },
      {
        id: 2,
        name: '华为 MatePad Pro',
        code: 'HW001',
        category: '平板',
        emoji: '📱',
        price: 3999,
        stock: 15,
        unit: '台'
      },
      {
        id: 3,
        name: 'MacBook Pro 14',
        code: 'MBP14001',
        category: '电脑',
        emoji: '💻',
        price: 14999,
        stock: 8,
        unit: '台'
      },
      {
        id: 4,
        name: '小米无线充电器',
        code: 'MI001',
        category: '配件',
        emoji: '🔋',
        price: 99,
        stock: 50,
        unit: '个'
      },
      {
        id: 5,
        name: 'AirPods Pro',
        code: 'AP001',
        category: '配件',
        emoji: '🎧',
        price: 1999,
        stock: 30,
        unit: '副'
      },
      {
        id: 6,
        name: '三星 Galaxy S24',
        code: 'SS001',
        category: '手机',
        emoji: '📱',
        price: 4999,
        stock: 20,
        unit: '台'
      },
      {
        id: 7,
        name: 'iPad Air',
        code: 'IPA001',
        category: '平板',
        emoji: '📱',
        price: 4599,
        stock: 12,
        unit: '台'
      },
      {
        id: 8,
        name: '联想 ThinkPad X1',
        code: 'TP001',
        category: '电脑',
        emoji: '💻',
        price: 12999,
        stock: 6,
        unit: '台'
      },
      {
        id: 9,
        name: '苹果手机壳',
        code: 'AC001',
        category: '配件',
        emoji: '📱',
        price: 199,
        stock: 100,
        unit: '个'
      },
      {
        id: 10,
        name: '无线鼠标',
        code: 'MS001',
        category: '配件',
        emoji: '🖱️',
        price: 299,
        stock: 45,
        unit: '个'
      }
    ],
    filteredProducts: []
  },

  onLoad: function (options) {
    this.setData({
      filteredProducts: this.data.products
    })
  },

  // 搜索输入
  onSearchInput: function (e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword })
    this.filterProducts()
  },

  // 按分类筛选
  filterByCategory: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.filterProducts()
  },

  // 筛选商品
  filterProducts: function () {
    let filtered = this.data.products

    // 按分类筛选
    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === this.data.currentCategory
      )
    }

    // 按关键词搜索
    if (this.data.searchKeyword) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.data.searchKeyword) ||
        product.code.toLowerCase().includes(this.data.searchKeyword)
      )
    }

    this.setData({ filteredProducts: filtered })
  },

  // 选择商品
  selectProduct: function (e) {
    const product = e.currentTarget.dataset.product
    
    // 检查库存
    if (product.stock <= 0) {
      wx.showToast({
        title: '商品缺货',
        icon: 'error'
      })
      return
    }

    // 触发选择事件，传递商品信息给上一页
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.emit('selectProduct', product)
    }

    // 显示成功提示
    wx.showToast({
      title: '已添加商品',
      icon: 'success',
      duration: 1000
    })

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack()
  }
})