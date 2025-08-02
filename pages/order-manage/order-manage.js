// pages/order-manage/order-manage.js
Page({
  data: {
    // 订单类型：sale-销售单，purchase-采购单
    orderType: 'sale',
    
    // 筛选选项
    statusOptions: ['全部状态', '待确认', '已确认', '已完成', '已取消'],
    statusIndex: 0,
    dateFilter: '',
    searchKeyword: '',
    
    // 订单列表
    orderList: [],
    refreshing: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    
    // 统计数据
    todayStats: {
      count: 0,
      amount: '0.00'
    },
    monthStats: {
      count: 0,
      amount: '0.00'
    }
  },

  onLoad(options) {
    console.log('订单管理页面加载，参数:', options);
    
    // 从参数中获取订单类型
    if (options.type) {
      this.setData({
        orderType: options.type
      });
    }
    
    // 立即设置一些默认数据，确保页面有内容
    this.setData({
      todayStats: {
        count: 14,
        amount: '45067.15'
      },
      monthStats: {
        count: 330,
        amount: '813487.88'
      }
    });
    
    // 初始化数据
    this.initData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 初始化数据
  initData() {
    console.log('开始初始化数据');
    
    // 立即生成一些测试数据
    const testOrders = this.generateMockOrders({
      type: this.data.orderType,
      page: 1,
      pageSize: 5
    });
    
    console.log('生成的测试订单:', testOrders);
    
    this.setData({
      orderList: testOrders,
      hasMore: true
    });
    
    // 然后异步加载完整数据
    this.loadOrderList();
    this.loadStatistics();
  },

  // 切换订单类型
  switchOrderType(e) {
    const { type } = e.currentTarget.dataset;
    if (type === this.data.orderType) return;
    
    this.setData({
      orderType: type,
      orderList: [],
      currentPage: 1,
      hasMore: true
    });
    
    this.loadOrderList();
    this.loadStatistics();
  },

  // 状态筛选
  onStatusChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      statusIndex: index,
      orderList: [],
      currentPage: 1,
      hasMore: true
    });
    
    this.loadOrderList();
  },

  // 日期筛选
  onDateChange(e) {
    this.setData({
      dateFilter: e.detail.value,
      orderList: [],
      currentPage: 1,
      hasMore: true
    });
    
    this.loadOrderList();
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    
    // 防抖搜索
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.setData({
        orderList: [],
        currentPage: 1,
        hasMore: true
      });
      this.loadOrderList();
    }, 500);
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      refreshing: true,
      orderList: [],
      currentPage: 1,
      hasMore: true
    });
    
    this.loadOrderList().finally(() => {
      this.setData({
        refreshing: false
      });
    });
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1
    });
    
    this.loadOrderList();
  },

  // 刷新数据
  refreshData() {
    this.setData({
      orderList: [],
      currentPage: 1,
      hasMore: true
    });
    
    this.loadOrderList();
    this.loadStatistics();
  },

  // 加载订单列表
  async loadOrderList() {
    try {
      const { orderType, statusIndex, dateFilter, searchKeyword, currentPage, pageSize } = this.data;
      
      console.log('开始加载订单列表，参数:', { orderType, statusIndex, dateFilter, searchKeyword, currentPage, pageSize });
      
      // 构建查询参数
      const params = {
        type: orderType,
        status: statusIndex > 0 ? this.getStatusByIndex(statusIndex) : '',
        date: dateFilter,
        keyword: searchKeyword,
        page: currentPage,
        pageSize
      };
      
      // 模拟API调用
      const result = await this.mockLoadOrders(params);
      console.log('加载到的订单数据:', result);
      
      const newOrderList = currentPage === 1 ? result.data : [...this.data.orderList, ...result.data];
      
      this.setData({
        orderList: newOrderList,
        hasMore: result.hasMore
      });
      
      console.log('设置后的订单列表长度:', newOrderList.length);
      
    } catch (error) {
      console.error('加载订单失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载统计数据
  async loadStatistics() {
    try {
      const { orderType } = this.data;
      const stats = await this.mockLoadStatistics(orderType);
      
      this.setData({
        todayStats: stats.today,
        monthStats: stats.month
      });
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 根据索引获取状态
  getStatusByIndex(index) {
    const statusMap = {
      1: 'pending',
      2: 'confirmed', 
      3: 'completed',
      4: 'cancelled'
    };
    return statusMap[index] || '';
  },

  // 新增订单
  addOrder() {
    const { orderType } = this.data;
    const url = orderType === 'sale' ? '/pages/product-select/product-select?from=sale' : '/pages/product-select/product-select?from=purchase';
    
    wx.navigateTo({
      url: url
    });
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const { order } = e.currentTarget.dataset;
    const { orderType } = this.data;
    
    // 查看订单详情，跳转到商品选择页面的查看模式
    const url = `/pages/product-select/product-select?from=${orderType}&mode=view&orderId=${order.id}`;
    
    wx.navigateTo({
      url: url
    });
  },

  // 编辑订单
  editOrder(e) {
    const order = e.currentTarget.dataset.order;
    const { orderType } = this.data;
    
    // 跳转到商品选择页面进行编辑
    wx.navigateTo({
      url: `/pages/product-select/product-select?from=${orderType}&mode=edit&orderId=${order.id}`
    });
  },

  // 确认订单
  confirmOrder(e) {
    const { order } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认订单',
      content: `确定要确认订单 ${order.orderNumber} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(order.id, 'confirmed');
        }
      }
    });
  },

  // 完成订单
  completeOrder(e) {
    const { order } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '完成订单',
      content: `确定要完成订单 ${order.orderNumber} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(order.id, 'completed');
        }
      }
    });
  },

  // 删除订单
  deleteOrder(e) {
    const { order } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '删除订单',
      content: `确定要删除订单 ${order.orderNumber} 吗？此操作不可恢复。`,
      confirmColor: '#dc3545',
      success: (res) => {
        if (res.confirm) {
          this.removeOrder(order.id);
        }
      }
    });
  },

  // 更新订单状态
  async updateOrderStatus(orderId, status) {
    try {
      // 模拟API调用
      await this.mockUpdateOrderStatus(orderId, status);
      
      // 更新本地数据
      const orderList = this.data.orderList.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            statusText: this.getStatusText(status)
          };
        }
        return order;
      });
      
      this.setData({ orderList });
      
      wx.showToast({
        title: '操作成功',
        icon: 'success'
      });
      
      // 刷新统计数据
      this.loadStatistics();
      
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除订单
  async removeOrder(orderId) {
    try {
      // 模拟API调用
      await this.mockDeleteOrder(orderId);
      
      // 更新本地数据
      const orderList = this.data.orderList.filter(order => order.id !== orderId);
      this.setData({ orderList });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      // 刷新统计数据
      this.loadStatistics();
      
    } catch (error) {
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知';
  },

  // 模拟加载订单数据
  mockLoadOrders(params) {
    return new Promise((resolve) => {
      // 立即返回数据，不延迟
      const mockData = this.generateMockOrders(params);
      console.log('生成的模拟数据:', mockData);
      resolve({
        data: mockData,
        hasMore: params.page < 3 // 模拟只有3页数据
      });
    });
  },

  // 生成模拟订单数据
  generateMockOrders(params) {
    const { type, page, pageSize } = params;
    const orders = [];
    
    for (let i = 0; i < pageSize; i++) {
      const id = (page - 1) * pageSize + i + 1;
      const orderNumber = type === 'sale' ? `XS${String(id).padStart(6, '0')}` : `CG${String(id).padStart(6, '0')}`;
      
      orders.push({
        id: id,
        orderNumber: orderNumber,
        createDate: this.formatDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
        status: ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)],
        statusText: ['待确认', '已确认', '已完成'][Math.floor(Math.random() * 3)],
        partnerName: type === 'sale' ? `客户${id}` : `供应商${id}`,
        contactPhone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        products: [
          {
            id: 1,
            name: '苹果 iPhone 15',
            specification: '128GB 粉色',
            quantity: Math.floor(Math.random() * 5) + 1,
            price: (Math.random() * 1000 + 5000).toFixed(2)
          },
          {
            id: 2,
            name: '华为 Mate 60',
            specification: '256GB 黑色',
            quantity: Math.floor(Math.random() * 3) + 1,
            price: (Math.random() * 800 + 4000).toFixed(2)
          }
        ],
        totalAmount: (Math.random() * 10000 + 5000).toFixed(2)
      });
    }
    
    return orders;
  },

  // 模拟加载统计数据
  mockLoadStatistics(type) {
    return new Promise((resolve) => {
      // 立即返回统计数据
      const stats = {
        today: {
          count: Math.floor(Math.random() * 20) + 5,
          amount: (Math.random() * 50000 + 10000).toFixed(2)
        },
        month: {
          count: Math.floor(Math.random() * 500) + 100,
          amount: (Math.random() * 1000000 + 200000).toFixed(2)
        }
      };
      console.log('生成的统计数据:', stats);
      resolve(stats);
    });
  },

  // 模拟更新订单状态
  mockUpdateOrderStatus(orderId, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  // 模拟删除订单
  mockDeleteOrder(orderId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  // 左滑移动处理
  onItemMove(e) {
    const { x } = e.detail;
    const index = e.currentTarget.dataset.index;
    
    // 当左滑超过一定距离时，显示操作按钮
    if (x < -100) {
      // 可以在这里添加震动反馈
      wx.vibrateShort();
    }
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});