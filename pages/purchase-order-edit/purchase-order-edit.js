// pages/purchase-order-edit/purchase-order-edit.js
Page({
  data: {
    isEdit: false,
    orderId: null,
    orderData: {
      orderNumber: '',
      supplier: '',
      deliveryDate: '',
      status: '',
      products: [],
      notes: ''
    },
    supplierOptions: [
      { id: 1, name: '华强电子有限公司', phone: '13900139000' },
      { id: 2, name: '深圳科技供应商', phone: '13800138000' },
      { id: 3, name: '广州电子厂', phone: '13700137000' }
    ],
    supplierIndex: 0,
    statusOptions: [
      { label: '待确认', value: 'pending' },
      { label: '已确认', value: 'confirmed' },
      { label: '采购中', value: 'purchasing' },
      { label: '已完成', value: 'completed' },
      { label: '已取消', value: 'cancelled' }
    ],
    statusIndex: 0,
    totalQuantity: 0,
    totalAmount: 0
  },

  onLoad(options) {
    this.generateOrderNumber();
    
    if (options.id) {
      this.setData({
        isEdit: true,
        orderId: options.id
      });
      this.loadOrderData(options.id);
    } else {
      this.calculateTotals();
    }
  },

  /**
   * 生成采购单号
   */
  generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `PO${year}${month}${day}${random}`;
    
    this.setData({
      'orderData.orderNumber': orderNumber
    });
  },

  /**
   * 加载采购订单数据
   */
  loadOrderData(orderId) {
    // 模拟从数据库加载采购订单数据
    const mockOrder = {
      id: orderId,
      orderNumber: 'PO20241226001',
      supplier: '华强电子有限公司',
      deliveryDate: '2024-12-30',
      status: 'confirmed',
      products: [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          sku: 'IP15P-256-BL',
          quantity: 10,
          price: 8999,
          unit: '台'
        },
        {
          id: 2,
          name: 'MacBook Pro 14',
          sku: 'MBP14-512-SG',
          quantity: 5,
          price: 15999,
          unit: '台'
        }
      ],
      notes: '请确保产品质量，按时交货'
    };

    const supplierIndex = this.data.supplierOptions.findIndex(s => s.name === mockOrder.supplier);
    const statusIndex = this.data.statusOptions.findIndex(s => s.value === mockOrder.status);

    this.setData({
      orderData: mockOrder,
      supplierIndex: supplierIndex >= 0 ? supplierIndex : 0,
      statusIndex: statusIndex >= 0 ? statusIndex : 0
    });

    this.calculateTotals();
  },

  /**
   * 供应商选择
   */
  onSupplierChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      supplierIndex: index,
      'orderData.supplier': this.data.supplierOptions[index].name
    });
  },

  /**
   * 交货日期选择
   */
  onDeliveryDateChange(e) {
    this.setData({
      'orderData.deliveryDate': e.detail.value
    });
  },

  /**
   * 状态选择
   */
  onStatusChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      statusIndex: index,
      'orderData.status': this.data.statusOptions[index].value
    });
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({
      'orderData.notes': e.detail.value
    });
  },

  /**
   * 添加商品
   */
  onAddProduct() {
    wx.navigateTo({
      url: '/pages/products/products?mode=select'
    });
  },

  /**
   * 增加商品数量
   */
  onIncreaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const products = this.data.orderData.products;
    products[index].quantity += 1;
    
    this.setData({
      'orderData.products': products
    });
    
    this.calculateTotals();
  },

  /**
   * 减少商品数量
   */
  onDecreaseQuantity(e) {
    const index = e.currentTarget.dataset.index;
    const products = this.data.orderData.products;
    
    if (products[index].quantity > 1) {
      products[index].quantity -= 1;
      
      this.setData({
        'orderData.products': products
      });
      
      this.calculateTotals();
    }
  },

  /**
   * 移除商品
   */
  onRemoveProduct(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          const products = this.data.orderData.products;
          products.splice(index, 1);
          
          this.setData({
            'orderData.products': products
          });
          
          this.calculateTotals();
        }
      }
    });
  },

  /**
   * 计算总计
   */
  calculateTotals() {
    const products = this.data.orderData.products;
    let totalQuantity = 0;
    let totalAmount = 0;

    products.forEach(product => {
      totalQuantity += product.quantity;
      totalAmount += product.quantity * product.price;
    });

    this.setData({
      totalQuantity,
      totalAmount: totalAmount.toFixed(2)
    });
  },

  /**
   * 保存采购订单
   */
  onSave() {
    const { orderData } = this.data;
    
    // 验证必填字段
    if (!orderData.supplier) {
      wx.showToast({
        title: '请选择供应商',
        icon: 'none'
      });
      return;
    }

    if (!orderData.deliveryDate) {
      wx.showToast({
        title: '请选择交货日期',
        icon: 'none'
      });
      return;
    }

    if (orderData.products.length === 0) {
      wx.showToast({
        title: '请添加采购商品',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.isEdit ? '保存中...' : '创建中...'
    });

    // 模拟保存操作
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '创建成功',
        icon: 'success'
      });

      // 触觉反馈
      wx.vibrateShort();

      // 返回上一页并刷新
      setTimeout(() => {
        wx.navigateBack({
          success: () => {
            // 通知上一页刷新数据
            const pages = getCurrentPages();
            if (pages.length > 1) {
              const prevPage = pages[pages.length - 2];
              if (prevPage.refreshData) {
                prevPage.refreshData();
              }
            }
          }
        });
      }, 1000);
    }, 1500);
  },

  /**
   * 取消操作
   */
  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？未保存的内容将丢失。',
      confirmText: '确定',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});