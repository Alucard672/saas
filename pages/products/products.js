// pages/products/products.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    searchKeyword: '',
    showSearch: false,
    showFilter: false,
    category: 'all',
    loading: false,
    hasMore: true,
    page: 0,
    pageSize: 20,
    // 统计数据
    totalProducts: 0,
    lowStockCount: 0,
    hotProductsCount: 0,
    totalValue: 0,
    // 筛选相关
    currentFilter: 'all',
    filteredProducts: [],
    allProducts: [],
    normalProducts: [],
    lowStockProducts: [],
    outOfStockProducts: [],
    // 左滑操作相关
    swipeItems: {},
    touchStartX: 0,
    touchStartY: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadProducts();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadProducts();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadProducts();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMoreProducts();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 加载商品数据
  loadProducts() {
    this.setData({
      loading: true
    });

    // 模拟商品数据
    const mockProducts = [
      {
        id: '1',
        name: '苹果 iPhone 15',
        code: 'IP15001',
        category: '手机',
        price: 5999,
        stock: 25,
        minStock: 10,
        image: '/images/product1.jpg',
        status: 'normal',
        createTime: '2024-01-15',
        sales: 156
      },
      {
        id: '2',
        name: '华为 Mate 60',
        code: 'HW60001',
        category: '手机',
        price: 6999,
        stock: 8,
        minStock: 10,
        image: '/images/product2.jpg',
        status: 'low_stock',
        createTime: '2024-01-14',
        sales: 89
      },
      {
        id: '3',
        name: '小米 14',
        code: 'MI14001',
        category: '手机',
        price: 3999,
        stock: 0,
        minStock: 5,
        image: '/images/product3.jpg',
        status: 'out_of_stock',
        createTime: '2024-01-13',
        sales: 234
      },
      {
        id: '4',
        name: 'MacBook Pro',
        code: 'MBP001',
        category: '电脑',
        price: 12999,
        stock: 15,
        minStock: 5,
        image: '/images/product4.jpg',
        status: 'normal',
        createTime: '2024-01-12',
        sales: 45
      },
      {
        id: '5',
        name: 'iPad Air',
        code: 'IPA001',
        category: '平板',
        price: 4599,
        stock: 3,
        minStock: 8,
        image: '/images/product5.jpg',
        status: 'low_stock',
        createTime: '2024-01-11',
        sales: 67
      }
    ];

    // 分类商品
    const allProducts = mockProducts;
    const normalProducts = mockProducts.filter(p => p.status === 'normal');
    const lowStockProducts = mockProducts.filter(p => p.status === 'low_stock');
    const outOfStockProducts = mockProducts.filter(p => p.status === 'out_of_stock');

    // 计算统计数据
    const totalProducts = mockProducts.length;
    const lowStockCount = lowStockProducts.length;
    const hotProductsCount = mockProducts.filter(p => p.sales > 100).length;
    const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

    this.setData({
      products: mockProducts,
      allProducts,
      normalProducts,
      lowStockProducts,
      outOfStockProducts,
      filteredProducts: mockProducts,
      totalProducts,
      lowStockCount,
      hotProductsCount,
      totalValue,
      loading: false
    });

    wx.stopPullDownRefresh();
  },

  // 加载更多商品
  loadMoreProducts() {
    if (!this.data.hasMore || this.data.loading) {
      return;
    }
    // 这里可以实现分页加载逻辑
  },

  // 搜索商品
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.searchProducts(keyword);
  },

  // 执行搜索
  searchProducts(keyword) {
    if (!keyword.trim()) {
      this.setData({
        filteredProducts: this.data.allProducts
      });
      return;
    }

    const filtered = this.data.allProducts.filter(product => 
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      product.code.toLowerCase().includes(keyword.toLowerCase())
    );

    this.setData({
      filteredProducts: filtered
    });
  },

  // 切换搜索框显示
  toggleSearch() {
    this.setData({
      showSearch: !this.data.showSearch
    });
  },

  // 筛选商品 - 全部
  filterAll() {
    this.setData({
      currentFilter: 'all',
      filteredProducts: this.data.allProducts
    });
  },

  // 筛选商品 - 正常
  filterNormal() {
    this.setData({
      currentFilter: 'normal',
      filteredProducts: this.data.normalProducts
    });
  },

  // 筛选商品 - 低库存
  filterLowStock() {
    this.setData({
      currentFilter: 'low_stock',
      filteredProducts: this.data.lowStockProducts
    });
  },

  // 筛选商品 - 缺货
  filterOutOfStock() {
    this.setData({
      currentFilter: 'out_of_stock',
      filteredProducts: this.data.outOfStockProducts
    });
  },

  // 添加商品
  addProduct() {
    wx.navigateTo({
      url: '/pages/product-add/product-add'
    });
  },

  // 查看商品详情
  viewProduct(e) {
    const productId = e.currentTarget.dataset.id;
    wx.showToast({
      title: `查看商品详情: ${productId}`,
      icon: 'none'
    });
    // 这里可以跳转到商品详情页面
    // wx.navigateTo({
    //   url: `/pages/product-detail/product-detail?id=${productId}`
    // });
  },

  // 编辑商品
  editProduct(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.filteredProducts.find(item => item.id === productId);
    
    if (product) {
      // 跳转到商品编辑页面，传递商品数据
      wx.navigateTo({
        url: `/pages/product-edit/product-edit?id=${productId}&data=${encodeURIComponent(JSON.stringify(product))}`
      });
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'error'
      });
    }
    wx.showToast({
      title: `编辑商品: ${productId}`,
      icon: 'none'
    });
    // 这里可以跳转到编辑商品页面
    // wx.navigateTo({
    //   url: `/pages/product-edit/product-edit?id=${productId}`
    // });
  },

  // 删除商品
  deleteProduct(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === productId);
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除商品"${product.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从数组中移除商品
          const updatedProducts = this.data.products.filter(p => p.id !== productId);
          const updatedAllProducts = this.data.allProducts.filter(p => p.id !== productId);
          const updatedFilteredProducts = this.data.filteredProducts.filter(p => p.id !== productId);
          
          this.setData({
            products: updatedProducts,
            allProducts: updatedAllProducts,
            filteredProducts: updatedFilteredProducts,
            totalProducts: updatedProducts.length
          });
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 库存预警处理
  handleStockAlert() {
    wx.showToast({
      title: '查看库存预警商品',
      icon: 'none'
    });
    this.filterLowStock();
  },

  // 触摸开始
  onTouchStart(e) {
    const { clientX, clientY } = e.touches[0];
    this.setData({
      touchStartX: clientX,
      touchStartY: clientY
    });
  },

  // 触摸移动
  onTouchMove(e) {
    const { clientX, clientY } = e.touches[0];
    const { touchStartX, touchStartY } = this.data;
    const deltaX = clientX - touchStartX;
    const deltaY = clientY - touchStartY;
    
    // 判断是否为水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const productId = e.currentTarget.dataset.id;
      const swipeItems = { ...this.data.swipeItems };
      
      if (deltaX < -50) {
        // 左滑显示操作按钮
        swipeItems[productId] = true;
      } else if (deltaX > 50) {
        // 右滑隐藏操作按钮
        swipeItems[productId] = false;
      }
      
      this.setData({
        swipeItems
      });
    }
  },

  // 触摸结束
  onTouchEnd(e) {
    // 重置触摸起始位置
    this.setData({
      touchStartX: 0,
      touchStartY: 0
    });
  },

  // 隐藏左滑操作
  hideSwipeAction(e) {
    const productId = e.currentTarget.dataset.id;
    const swipeItems = { ...this.data.swipeItems };
    swipeItems[productId] = false;
    this.setData({
      swipeItems
    });
  },

  // 点击商品项（非操作按钮区域）
  onProductTap(e) {
    const productId = e.currentTarget.dataset.id;
    // 如果有展开的左滑操作，先收起
    if (this.data.swipeItems[productId]) {
      this.hideSwipeAction(e);
      return;
    }
    // 否则查看商品详情
    this.viewProduct(e);
  }
});