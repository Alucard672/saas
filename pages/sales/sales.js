// pages/sales/sales.js
Page({
  data: {
    currentFilter: 'all',
    searchKeyword: '',
    sales: [],
    filteredSales: [],
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    // 左滑手势相关
    swipeItems: {}, // 记录每个销售单的左滑状态
    touchStartX: 0,
    touchStartY: 0,
    touchMoveX: 0,
    touchMoveY: 0,
    currentSwipeId: null
  },

  onLoad() {
    this.loadSales();
  },

  onShow() {
    this.loadSales();
  },

  // 加载销售数据
  loadSales() {
    // 模拟销售数据
    const mockSales = [
      {
        id: '1',
        orderNo: 'SO20240126001',
        customer: '张三',
        phone: '138****1234',
        totalAmount: 1299,
        status: 'completed',
        paymentMethod: '微信支付',
        createTime: new Date('2024-01-26 14:30:00'),
        items: [
          { productName: '智能手机', quantity: 1, price: 999, amount: 999 },
          { productName: '手机壳', quantity: 1, price: 39, amount: 39 },
          { productName: '钢化膜', quantity: 1, price: 29, amount: 29 },
          { productName: '数据线', quantity: 1, price: 49, amount: 49 },
          { productName: '充电器', quantity: 1, price: 89, amount: 89 },
          { productName: '耳机', quantity: 1, price: 199, amount: 199 }
        ]
      },
      {
        id: '2',
        orderNo: 'SO20240126002',
        customer: '李四',
        phone: '139****5678',
        totalAmount: 599,
        status: 'pending',
        paymentMethod: '支付宝',
        createTime: new Date('2024-01-26 16:45:00'),
        items: [
          { productName: '蓝牙耳机', quantity: 1, price: 299, amount: 299 },
          { productName: '充电宝', quantity: 1, price: 159, amount: 159 },
          { productName: '数据线', quantity: 1, price: 49, amount: 49 },
          { productName: '手机支架', quantity: 1, price: 29, amount: 29 },
          { productName: '清洁套装', quantity: 1, price: 39, amount: 39 }
        ]
      },
      {
        id: '3',
        orderNo: 'SO20240125001',
        customer: '王五',
        phone: '137****9012',
        totalAmount: 2199,
        status: 'completed',
        paymentMethod: '现金',
        createTime: new Date('2024-01-25 09:15:00'),
        items: [
          { productName: '平板电脑', quantity: 1, price: 1999, amount: 1999 },
          { productName: '保护套', quantity: 1, price: 99, amount: 99 },
          { productName: '触控笔', quantity: 1, price: 199, amount: 199 }
        ]
      },
      {
        id: '4',
        orderNo: 'SO20240125002',
        customer: '赵六',
        phone: '136****3456',
        totalAmount: 4999,
        status: 'completed',
        paymentMethod: '微信支付',
        createTime: new Date('2024-01-25 10:20:00'),
        items: [
          { productName: '笔记本电脑', quantity: 1, price: 4999, amount: 4999 }
        ]
      },
      {
        id: '5',
        orderNo: 'SO20240124001',
        customer: '孙七',
        phone: '135****7890',
        totalAmount: 687,
        status: 'cancelled',
        paymentMethod: '支付宝',
        createTime: new Date('2024-01-24 15:30:00'),
        items: [
          { productName: '运动鞋', quantity: 1, price: 299, amount: 299 },
          { productName: '护肤霜', quantity: 1, price: 199, amount: 199 },
          { productName: '背包', quantity: 1, price: 159, amount: 159 },
          { productName: '水杯', quantity: 1, price: 49, amount: 49 }
        ]
      }
    ];

    this.setData({
      sales: mockSales,
      filteredSales: mockSales
    });

    this.calculateStats();
    this.filterSales();
  },

  // 计算统计数据
  calculateStats() {
    const { sales } = this.data;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalSales = 0;
    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;

    sales.forEach(sale => {
      if (sale.status === 'completed') {
        totalSales += sale.totalAmount;
        
        const saleDate = new Date(sale.createTime);
        if (saleDate >= today) {
          todaySales += sale.totalAmount;
        }
        if (saleDate >= weekStart) {
          weekSales += sale.totalAmount;
        }
        if (saleDate >= monthStart) {
          monthSales += sale.totalAmount;
        }
      }
    });

    this.setData({
      totalSales,
      todaySales,
      weekSales,
      monthSales
    });
  },

  // 搜索功能
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterSales();
  },

  // 筛选功能
  selectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
    this.filterSales();
  },

  // 执行筛选
  filterSales() {
    const { sales, currentFilter, searchKeyword } = this.data;
    let filtered = sales;

    // 按状态筛选
    if (currentFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === currentFilter);
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(sale => 
        sale.orderNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        sale.phone.includes(searchKeyword)
      );
    }

    this.setData({
      filteredSales: filtered
    });
  },

  // 左滑手势处理
  onTouchStart(e) {
    const { clientX, clientY } = e.touches[0];
    this.setData({
      touchStartX: clientX,
      touchStartY: clientY,
      touchMoveX: clientX,
      touchMoveY: clientY
    });
  },

  onTouchMove(e) {
    const { clientX, clientY } = e.touches[0];
    this.setData({
      touchMoveX: clientX,
      touchMoveY: clientY
    });
  },

  onTouchEnd(e) {
    const { touchStartX, touchStartY, touchMoveX, touchMoveY, swipeItems } = this.data;
    const deltaX = touchMoveX - touchStartX;
    const deltaY = touchMoveY - touchStartY;
    const saleId = e.currentTarget.dataset.id;

    // 判断是否为左滑手势（水平滑动距离大于垂直滑动距离，且向左滑动超过50px）
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -50) {
      // 左滑显示操作按钮
      const newSwipeItems = { ...swipeItems };
      
      // 关闭其他已展开的项
      Object.keys(newSwipeItems).forEach(key => {
        if (key !== saleId) {
          newSwipeItems[key] = false;
        }
      });
      
      newSwipeItems[saleId] = true;
      this.setData({
        swipeItems: newSwipeItems,
        currentSwipeId: saleId
      });
    } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
      // 右滑收起操作按钮
      const newSwipeItems = { ...swipeItems };
      newSwipeItems[saleId] = false;
      this.setData({
        swipeItems: newSwipeItems,
        currentSwipeId: null
      });
    }
  },

  // 点击销售单主体
  onSaleTap(e) {
    const saleId = e.currentTarget.dataset.id;
    const { swipeItems } = this.data;
    
    // 如果有展开的左滑操作，先收起
    if (swipeItems[saleId]) {
      const newSwipeItems = { ...swipeItems };
      newSwipeItems[saleId] = false;
      this.setData({
        swipeItems: newSwipeItems,
        currentSwipeId: null
      });
      return;
    }
    
    // 查看销售详情
    this.viewSaleDetail(e);
  },

  // 查看销售详情
  viewSaleDetail(e) {
    const saleId = e.currentTarget.dataset.id;
    const { sales } = this.data;
    const sale = sales.find(s => s.id === saleId);
    
    if (sale) {
      wx.showModal({
        title: `销售单详情 - ${sale.orderNo}`,
        content: `客户：${sale.customer}\n电话：${sale.phone}\n金额：¥${sale.totalAmount}\n状态：${this.getStatusText(sale.status)}\n支付方式：${sale.paymentMethod}\n时间：${this.formatTime(sale.createTime)}`,
        showCancel: false,
        confirmText: '确定'
      });
    }
  },

  // 编辑销售单
  editSale(e) {
    const saleId = e.currentTarget.dataset.id;
    const { sales } = this.data;
    const sale = sales.find(s => s.id === saleId);
    
    if (sale) {
      // 先收起左滑操作
      const { swipeItems } = this.data;
      const newSwipeItems = { ...swipeItems };
      newSwipeItems[saleId] = false;
      this.setData({
        swipeItems: newSwipeItems,
        currentSwipeId: null
      });
      
      // 跳转到销售单编辑页面
      wx.navigateTo({
        url: `/pages/sale-edit/sale-edit?id=${saleId}&data=${encodeURIComponent(JSON.stringify(sale))}`
      });
    }
  },

  // 模拟编辑操作
  simulateEdit(saleId) {
    const { sales } = this.data;
    const saleIndex = sales.findIndex(s => s.id === saleId);
    
    if (saleIndex !== -1) {
      // 模拟修改数据
      const updatedSales = [...sales];
      updatedSales[saleIndex] = {
        ...updatedSales[saleIndex],
        totalAmount: updatedSales[saleIndex].totalAmount + Math.floor(Math.random() * 100),
        updateTime: new Date()
      };
      
      this.setData({
        sales: updatedSales
      });
      
      this.filterSales();
      this.calculateStats();
      
      // 生成操作日志
      this.logOperation('edit', saleId, '修改销售单信息');
      
      wx.showToast({
        title: '编辑成功',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 删除销售单
  deleteSale(e) {
    const saleId = e.currentTarget.dataset.id;
    const { sales } = this.data;
    const sale = sales.find(s => s.id === saleId);
    
    if (sale) {
      // 先收起左滑操作
      const { swipeItems } = this.data;
      const newSwipeItems = { ...swipeItems };
      newSwipeItems[saleId] = false;
      this.setData({
        swipeItems: newSwipeItems,
        currentSwipeId: null
      });
      
      // 二次确认删除
      wx.showModal({
        title: '确认删除',
        content: `确定要删除销售单 ${sale.orderNo} 吗？\n\n删除后数据无法恢复，但会保留操作日志记录。`,
        confirmText: '删除',
        cancelText: '取消',
        confirmColor: '#ff6b9d',
        success: (res) => {
          if (res.confirm) {
            this.performDelete(saleId);
          }
        }
      });
    }
  },

  // 执行删除操作
  performDelete(saleId) {
    const { sales } = this.data;
    const saleToDelete = sales.find(s => s.id === saleId);
    
    if (saleToDelete) {
      // 从数据中移除
      const updatedSales = sales.filter(s => s.id !== saleId);
      
      this.setData({
        sales: updatedSales
      });
      
      this.filterSales();
      this.calculateStats();
      
      // 生成操作日志
      this.logOperation('delete', saleId, `删除销售单 ${saleToDelete.orderNo}`);
      
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 记录操作日志
  logOperation(action, saleId, description) {
    const logEntry = {
      id: Date.now().toString(),
      action,
      targetId: saleId,
      description,
      timestamp: new Date(),
      operator: '当前用户' // 实际应用中应该是真实的用户信息
    };
    
    // 这里应该将日志保存到数据库
    console.log('操作日志:', logEntry);
    
    // 可以将日志存储到本地存储或发送到服务器
    try {
      const logs = wx.getStorageSync('operation_logs') || [];
      logs.unshift(logEntry);
      // 只保留最近100条日志
      if (logs.length > 100) {
        logs.splice(100);
      }
      wx.setStorageSync('operation_logs', logs);
    } catch (error) {
      console.error('保存操作日志失败:', error);
    }
  },

  // 添加销售单
  addSale() {
    wx.showToast({
      title: '跳转到添加页面',
      icon: 'none',
      duration: 1500
    });
    
    // 实际应用中应该跳转到添加销售单页面
    // wx.navigateTo({
    //   url: '/pages/sale-add/sale-add'
    // });
  },

  // 时间筛选
  selectTimeFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    
    wx.showActionSheet({
      itemList: ['今日', '本周', '本月', '全部'],
      success: (res) => {
        const filters = ['today', 'week', 'month', 'all'];
        const selectedFilter = filters[res.tapIndex];
        
        wx.showToast({
          title: `已选择${['今日', '本周', '本月', '全部'][res.tapIndex]}`,
          icon: 'none',
          duration: 1000
        });
        
        // 这里可以根据时间筛选数据
        this.filterByTime(selectedFilter);
      }
    });
  },

  // 按时间筛选
  filterByTime(timeFilter) {
    const { sales } = this.data;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let filtered = sales;
    
    switch (timeFilter) {
      case 'today':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createTime);
          return saleDate >= today;
        });
        break;
      case 'week':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createTime);
          return saleDate >= weekStart;
        });
        break;
      case 'month':
        filtered = sales.filter(sale => {
          const saleDate = new Date(sale.createTime);
          return saleDate >= monthStart;
        });
        break;
      default:
        filtered = sales;
    }
    
    this.setData({
      filteredSales: filtered
    });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'completed': '已完成',
      'pending': '待处理',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  },

  // 格式化时间
  formatTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 页面生命周期函数--监听页面初次渲染完成
  onReady() {

  },

  // 页面生命周期函数--监听页面显示
  onShow() {

  },

  // 页面生命周期函数--监听页面隐藏
  onHide() {

  },

  // 页面生命周期函数--监听页面卸载
  onUnload() {

  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh() {
    this.loadSales();
    wx.stopPullDownRefresh();
  },

  // 页面上拉触底事件的处理函数
  onReachBottom() {

  },

  // 用户点击右上角分享
  onShareAppMessage() {

  }
});