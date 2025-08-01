// pages/suppliers/suppliers.js
Page({
  data: {
    searchKeyword: '',
    activeFilter: 'all',
    totalSuppliers: 0,
    coreSuppliers: 0,
    activeSuppliers: 0,
    suppliers: [],
    filteredSuppliers: [],
    touchStartX: 0,
    touchStartY: 0,
    swipedIndex: -1
  },

  onLoad: function (options) {
    this.loadSuppliers()
  },

  onShow: function () {
    this.loadSuppliers()
  },

  // 格式化日期显示
  formatDate: function(dateStr) {
    if (!dateStr) return '暂无记录'
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return dateStr // 如果日期无效，返回原字符串
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      const diffTime = targetDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const formatStr = `${month}月${day}日`
      
      if (diffDays === 0) {
        return `今天 (${formatStr})`
      } else if (diffDays === 1) {
        return `明天 (${formatStr})`
      } else if (diffDays === -1) {
        return `昨天 (${formatStr})`
      } else if (diffDays > 1 && diffDays <= 7) {
        return `${diffDays}天后 (${formatStr})`
      } else if (diffDays < -1 && diffDays >= -7) {
        return `${Math.abs(diffDays)}天前 (${formatStr})`
      } else {
        return `${date.getFullYear()}年${formatStr}`
      }
    } catch (error) {
      console.error('日期格式化错误:', error)
      return dateStr
    }
  },

  // 加载厂商数据
  loadSuppliers: function () {
    wx.showLoading({
      title: '加载中...'
    })

    // 模拟厂商数据
    const mockSuppliers = [
      {
        id: 1,
        name: 'A公司',
        contactPerson: '张经理',
        phone: '13900139001',
        address: '北京市海淀区',
        level: 'core',
        levelText: '核心厂商',
        statusText: '核心',
        totalAmount: 258000,
        orderCount: 58,
        lastOrderDate: '2024-01-15',
        avatar: '🏢',
        swiped: false
      },
      {
        id: 2,
        name: 'B公司',
        contactPerson: '李经理',
        phone: '13900139002',
        address: '上海市闵行区',
        level: 'regular',
        levelText: '普通厂商',
        statusText: '正常',
        totalAmount: 125000,
        orderCount: 32,
        lastOrderDate: '2024-01-10',
        avatar: '🏭',
        swiped: false
      },
      {
        id: 3,
        name: 'C公司',
        contactPerson: '王经理',
        phone: '13900139003',
        address: '深圳市福田区',
        level: 'inactive',
        levelText: '停用厂商',
        statusText: '停用',
        totalAmount: 35000,
        orderCount: 15,
        lastOrderDate: '2023-11-20',
        avatar: '🏬',
        swiped: false
      }
    ]

    setTimeout(() => {
      wx.hideLoading()
      
      // 格式化日期显示
      const formattedSuppliers = mockSuppliers.map(supplier => {
        const formattedDate = this.formatDate(supplier.lastOrderDate)
        return {
          ...supplier,
          lastOrderDate: typeof formattedDate === 'string' ? formattedDate : '暂无记录'
        }
      })
      
      this.setData({
        suppliers: formattedSuppliers,
        totalSuppliers: formattedSuppliers.length,
        coreSuppliers: formattedSuppliers.filter(s => s.level === 'core').length,
        activeSuppliers: formattedSuppliers.filter(s => s.level !== 'inactive').length
      })
      
      this.filterSuppliers()
    }, 1000)
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterSuppliers()
  },

  // 筛选切换
  onFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter
    })
    this.filterSuppliers()
  },

  // 筛选厂商
  filterSuppliers: function () {
    const { suppliers, searchKeyword, activeFilter } = this.data
    let filtered = suppliers

    // 按关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(supplier => 
        supplier.name.includes(searchKeyword) ||
        supplier.contactPerson.includes(searchKeyword) ||
        supplier.phone.includes(searchKeyword)
      )
    }

    // 按类型筛选
    if (activeFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.level === activeFilter)
    }

    this.setData({
      filteredSuppliers: filtered
    })
  },

  // 厂商点击
  onSupplierTap: function (e) {
    const supplier = e.currentTarget.dataset.supplier
    const index = e.currentTarget.dataset.index
    
    // 如果当前项已滑动，则收回
    if (supplier.swiped) {
      this.resetSwipe()
      return
    }
    
    // 显示厂商详情
    wx.showModal({
      title: supplier.name,
      content: `联系人：${supplier.contactPerson}\n电话：${supplier.phone}\n地址：${supplier.address}`,
      showCancel: false
    })
  },

  // 触摸开始
  onTouchStart: function (e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    })
  },

  // 触摸移动
  onTouchMove: function (e) {
    const { touchStartX, touchStartY } = this.data
    const touchMoveX = e.touches[0].clientX
    const touchMoveY = e.touches[0].clientY
    
    const deltaX = touchMoveX - touchStartX
    const deltaY = touchMoveY - touchStartY
    
    // 判断是否为水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const index = e.currentTarget.dataset.index
      
      if (deltaX < -50) {
        // 左滑显示操作按钮
        this.showSwipeActions(index)
      } else if (deltaX > 50) {
        // 右滑隐藏操作按钮
        this.resetSwipe()
      }
    }
  },

  // 触摸结束
  onTouchEnd: function (e) {
    // 重置触摸坐标
    this.setData({
      touchStartX: 0,
      touchStartY: 0
    })
  },

  // 显示滑动操作
  showSwipeActions: function (index) {
    this.resetSwipe()
    
    const filteredSuppliers = this.data.filteredSuppliers.map((supplier, i) => {
      return {
        ...supplier,
        swiped: i === index
      }
    })
    
    this.setData({
      filteredSuppliers,
      swipedIndex: index
    })
  },

  // 重置滑动状态
  resetSwipe: function () {
    const filteredSuppliers = this.data.filteredSuppliers.map(supplier => ({
      ...supplier,
      swiped: false
    }))
    
    this.setData({
      filteredSuppliers,
      swipedIndex: -1
    })
  },

  // 编辑厂商
  onEditSupplier: function (e) {
    const supplier = e.currentTarget.dataset.supplier
    this.resetSwipe()
    
    wx.showToast({
      title: `编辑厂商：${supplier.name}`,
      icon: 'none'
    })
    
    // TODO: 跳转到编辑厂商页面
    // wx.navigateTo({
    //   url: `/pages/supplier-edit/supplier-edit?id=${supplier.id}`
    // })
  },

  // 删除厂商
  onDeleteSupplier: function (e) {
    const supplier = e.currentTarget.dataset.supplier
    this.resetSwipe()
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除厂商"${supplier.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteSupplier(supplier.id)
        }
      }
    })
  },

  // 执行删除厂商
  deleteSupplier: function (supplierId) {
    wx.showLoading({
      title: '删除中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      const suppliers = this.data.suppliers.filter(s => s.id !== supplierId)
      this.setData({
        suppliers,
        totalSuppliers: suppliers.length,
        coreSuppliers: suppliers.filter(s => s.level === 'core').length,
        activeSuppliers: suppliers.filter(s => s.level !== 'inactive').length
      })
      
      this.filterSuppliers()
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 添加厂商
  onAddSupplier: function () {
    wx.showToast({
      title: '跳转到添加厂商页面',
      icon: 'none'
    })
    
    // TODO: 跳转到添加厂商页面
    // wx.navigateTo({
    //   url: '/pages/supplier-add/supplier-add'
    // })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadSuppliers()
    wx.stopPullDownRefresh()
  }
})