// pages/add-product/add-product.js
const app = getApp()

Page({
  data: {
    isEdit: false,
    productId: '',
    selectedEmoji: '📦',
    emojiList: ['📦', '🍎', '🥤', '🍪', '🧴', '📱', '👕', '📚', '🎮', '🏠', '🚗', '💄', '🎁', '🌺', '⚡', '💎'],
    categoryList: ['食品', '饮料', '日用品', '电子产品', '服装', '图书', '玩具', '家居', '其他'],
    categoryIndex: 0,
    unitList: ['个', '瓶', '包', '箱', '盒', '袋', '罐', '支', '条', '件', '套', '双', '只', '台', '本', '张'],
    unitIndex: 0,
    formData: {
      name: '',
      sku: '',
      category: '食品',
      unit: '个',
      price: '',
      stock: '',
      minStock: '',
      description: '',
      emoji: '📦',
      isHot: false
    }
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ 
        isEdit: true, 
        productId: options.id 
      })
      this.loadProductDetail(options.id)
    }
    
    // 如果是从扫码入口进入，自动触发扫码
    if (options.scan === 'true') {
      setTimeout(() => {
        this.scanCode()
      }, 500) // 延迟500ms确保页面加载完成
    }
  },

  // 加载商品详情
  loadProductDetail: function (id) {
    wx.showLoading({ title: '加载中...' })

    app.getOpenid().then(openid => {
      return wx.cloud.callFunction({
        name: 'products',
        data: {
          action: 'detail',
          openid: openid,
          productId: id
        }
      })
    }).then(res => {
      wx.hideLoading()
      if (res.result.product) {
        const product = res.result.product
        const categoryIndex = this.data.categoryList.findIndex(cat => cat === product.category)
        
        this.setData({
          formData: {
            name: product.name || '',
            sku: product.sku || '',
            category: product.category || '食品',
            unit: product.unit || '个',
            price: product.price || '',
            stock: product.stock || '',
            minStock: product.minStock || '',
            description: product.description || '',
            emoji: product.emoji || '📦',
            isHot: product.isHot || false
          },
          selectedEmoji: product.emoji || '📦',
          categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
          unitIndex: this.data.unitList.findIndex(unit => unit === (product.unit || '个'))
        })
      }
    }).catch(err => {
      console.error('加载商品详情失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    })
  },

  // 选择Emoji
  selectEmoji: function (e) {
    const emoji = e.currentTarget.dataset.emoji
    this.setData({
      selectedEmoji: emoji,
      'formData.emoji': emoji
    })
  },

  // 输入框变化
  onInputChange: function (e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 分类选择
  onCategoryChange: function (e) {
    const index = e.detail.value
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categoryList[index]
    })
  },

  // 包装单位选择
  onUnitChange: function (e) {
    const index = e.detail.value
    this.setData({
      unitIndex: index,
      'formData.unit': this.data.unitList[index]
    })
  },

  // 开关变化
  onSwitchChange: function (e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 表单验证
  validateForm: function () {
    const { name, price, stock } = this.data.formData
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'error'
      })
      return false
    }
    
    if (!price || parseFloat(price) <= 0) {
      wx.showToast({
        title: '请输入有效价格',
        icon: 'error'
      })
      return false
    }
    
    if (!stock || parseInt(stock) < 0) {
      wx.showToast({
        title: '请输入有效库存',
        icon: 'error'
      })
      return false
    }
    
    return true
  },

  // 保存商品
  saveProduct: function () {
    if (!this.validateForm()) return

    wx.showLoading({ title: '保存中...' })

    const formData = {
      ...this.data.formData,
      price: parseFloat(this.data.formData.price),
      stock: parseInt(this.data.formData.stock),
      minStock: this.data.formData.minStock ? parseInt(this.data.formData.minStock) : 0
    }

    app.getOpenid().then(openid => {
      return wx.cloud.callFunction({
        name: 'products',
        data: {
          action: this.data.isEdit ? 'update' : 'add',
          openid: openid,
          productId: this.data.productId,
          product: formData
        }
      })
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({
          title: this.data.isEdit ? '更新成功' : '添加成功',
          icon: 'success'
        })
        
        // 返回上一页并刷新
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.loadProducts) {
            prevPage.loadProducts()
          }
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message || '保存失败')
      }
    }).catch(err => {
      console.error('保存商品失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    })
  },

  // 删除商品
  deleteProduct: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#fa709a',
      success: (res) => {
        if (res.confirm) {
          this.confirmDelete()
        }
      }
    })
  },

  confirmDelete: function () {
    wx.showLoading({ title: '删除中...' })

    app.getOpenid().then(openid => {
      return wx.cloud.callFunction({
        name: 'products',
        data: {
          action: 'delete',
          openid: openid,
          productId: this.data.productId
        }
      })
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 返回上一页并刷新
        setTimeout(() => {
          const pages = getCurrentPages()
          const prevPage = pages[pages.length - 2]
          if (prevPage && prevPage.loadProducts) {
            prevPage.loadProducts()
          }
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message || '删除失败')
      }
    }).catch(err => {
      console.error('删除商品失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    })
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack()
  },

  // 扫码功能
  scanCode: function () {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        console.log('扫码结果:', res)
        this.handleScanResult(res.result)
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        wx.showToast({
          title: '扫码失败',
          icon: 'error'
        })
      }
    })
  },

  // 处理扫码结果
  handleScanResult: function (result) {
    // 尝试解析条形码/二维码内容
    let productInfo = this.parseBarcode(result)
    
    if (productInfo) {
      // 显示确认对话框
      wx.showModal({
        title: '扫码成功',
        content: `是否使用扫码结果填充商品信息？\n\n商品编码: ${productInfo.sku}\n商品名称: ${productInfo.name || '未知'}`,
        confirmText: '使用',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.fillProductInfo(productInfo)
          }
        }
      })
    } else {
      // 如果无法解析，直接填充编码
      this.setData({
        'formData.sku': result
      })
      wx.showToast({
        title: '已填充商品编码',
        icon: 'success'
      })
    }
  },

  // 解析条形码
  parseBarcode: function (barcode) {
    // 这里可以添加更复杂的条形码解析逻辑
    // 目前简单处理，可以根据实际需求扩展
    
    // 如果是标准的EAN-13条形码
    if (barcode.length === 13 && /^\d+$/.test(barcode)) {
      return {
        sku: barcode,
        name: '扫码商品',
        category: '其他',
        unit: '个'
      }
    }
    
    // 如果是二维码包含商品信息
    if (barcode.includes('product') || barcode.includes('item')) {
      try {
        const data = JSON.parse(barcode)
        return {
          sku: data.sku || data.code || barcode,
          name: data.name || data.title || '扫码商品',
          category: data.category || '其他',
          unit: data.unit || this.guessUnit(data.name || ''),
          price: data.price || '',
          description: data.description || ''
        }
      } catch (e) {
        // 解析失败，返回基本信息
        return {
          sku: barcode,
          name: '扫码商品',
          category: '其他',
          unit: '个'
        }
      }
    }
    
    // 默认返回基本信息
    return {
      sku: barcode,
      name: '扫码商品',
      category: '其他',
      unit: '个'
    }
  },

  // 根据商品名称猜测包装单位
  guessUnit: function (productName) {
    const name = productName.toLowerCase()
    
    // 饮料类
    if (name.includes('饮料') || name.includes('水') || name.includes('茶') || name.includes('咖啡') || name.includes('果汁')) {
      return '瓶'
    }
    
    // 食品类
    if (name.includes('零食') || name.includes('饼干') || name.includes('糖果') || name.includes('巧克力')) {
      return '包'
    }
    
    // 日用品
    if (name.includes('洗发水') || name.includes('沐浴露') || name.includes('牙膏') || name.includes('洗面奶')) {
      return '瓶'
    }
    
    // 服装类
    if (name.includes('衣服') || name.includes('裤子') || name.includes('鞋子') || name.includes('帽子')) {
      return '件'
    }
    
    // 电子产品
    if (name.includes('手机') || name.includes('电脑') || name.includes('耳机') || name.includes('充电器')) {
      return '台'
    }
    
    // 图书类
    if (name.includes('书') || name.includes('杂志') || name.includes('报纸')) {
      return '本'
    }
    
    // 玩具类
    if (name.includes('玩具') || name.includes('游戏') || name.includes('积木')) {
      return '个'
    }
    
    // 家居类
    if (name.includes('家具') || name.includes('装饰') || name.includes('灯具')) {
      return '件'
    }
    
    // 默认返回个
    return '个'
  },

  // 填充商品信息
  fillProductInfo: function (productInfo) {
    const categoryIndex = this.data.categoryList.findIndex(cat => cat === productInfo.category)
    const unitIndex = this.data.unitList.findIndex(unit => unit === productInfo.unit)
    
    this.setData({
      'formData.sku': productInfo.sku,
      'formData.name': productInfo.name || this.data.formData.name,
      'formData.category': productInfo.category || this.data.formData.category,
      'formData.unit': productInfo.unit || this.data.formData.unit,
      'formData.price': productInfo.price || this.data.formData.price,
      'formData.description': productInfo.description || this.data.formData.description,
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      unitIndex: unitIndex >= 0 ? unitIndex : 0
    })
    
    wx.showToast({
      title: '信息已填充',
      icon: 'success'
    })
  }
}) 