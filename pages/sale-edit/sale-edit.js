// pages/sale-edit/sale-edit.js
Page({
  data: {
    originalData: {},
    formData: {
      orderNo: '',
      customer: '',
      phone: '',
      status: 'pending',
      paymentMethod: '微信支付',
      totalAmount: 0,
      items: [],
      remark: ''
    },
    errors: {},
    submitting: false,
    
    // 选择器数据
    statusOptions: [
      { value: 'pending', label: '待处理' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ],
    paymentOptions: ['微信支付', '支付宝', '现金', '银行卡'],
    statusIndex: 0,
    paymentIndex: 0,
    
    // 商品弹窗
    showAddItem: false,
    newItem: {
      productName: '',
      quantity: 1,
      price: 0,
      amount: 0
    },
    itemErrors: {},
    editingIndex: undefined
  },

  onLoad(options) {
    if (options.id && options.data) {
      try {
        const saleData = JSON.parse(decodeURIComponent(options.data));
        this.initializeData(saleData);
      } catch (error) {
        console.error('解析销售单数据失败:', error);
        wx.showToast({
          title: '数据加载失败',
          icon: 'error'
        });
      }
    }
  },

  // 初始化数据
  initializeData(saleData) {
    const statusIndex = this.data.statusOptions.findIndex(item => item.value === saleData.status);
    const paymentIndex = this.data.paymentOptions.findIndex(item => item === saleData.paymentMethod);
    
    this.setData({
      originalData: { ...saleData },
      formData: {
        orderNo: saleData.orderNo || '',
        customer: saleData.customer || '',
        phone: saleData.phone || '',
        status: saleData.status || 'pending',
        paymentMethod: saleData.paymentMethod || '微信支付',
        totalAmount: saleData.totalAmount || 0,
        items: saleData.items || [],
        remark: saleData.remark || ''
      },
      statusIndex: statusIndex >= 0 ? statusIndex : 0,
      paymentIndex: paymentIndex >= 0 ? paymentIndex : 0
    });
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: ''
    });
    
    // 如果是金额字段，重新计算总金额
    if (field === 'totalAmount') {
      this.calculateTotalAmount();
    }
  },

  // 状态选择
  onStatusChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      statusIndex: index,
      'formData.status': this.data.statusOptions[index].value,
      'errors.status': ''
    });
  },

  // 支付方式选择
  onPaymentChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      paymentIndex: index,
      'formData.paymentMethod': this.data.paymentOptions[index],
      'errors.paymentMethod': ''
    });
  },

  // 显示添加商品弹窗
  showAddItemModal() {
    this.setData({
      showAddItem: true,
      newItem: {
        productName: '',
        quantity: 1,
        price: 0,
        amount: 0
      },
      itemErrors: {},
      editingIndex: undefined
    });
  },

  // 隐藏添加商品弹窗
  hideAddItemModal() {
    this.setData({
      showAddItem: false
    });
  },

  // 商品输入处理
  onItemInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    const newItem = { ...this.data.newItem };
    newItem[field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    
    // 计算小计
    if (field === 'quantity' || field === 'price') {
      newItem.amount = (newItem.quantity * newItem.price).toFixed(2);
    }
    
    this.setData({
      newItem,
      [`itemErrors.${field}`]: ''
    });
  },

  // 添加商品到列表
  addItemToList() {
    if (!this.validateItem()) return;
    
    const { formData, newItem } = this.data;
    const newItems = [...formData.items];
    
    newItems.push({
      id: Date.now().toString(),
      ...newItem,
      amount: parseFloat(newItem.amount)
    });
    
    this.setData({
      'formData.items': newItems,
      showAddItem: false
    });
    
    this.calculateTotalAmount();
  },

  // 编辑商品
  editItem(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.formData.items[index];
    
    this.setData({
      showAddItem: true,
      newItem: { ...item },
      editingIndex: index,
      itemErrors: {}
    });
  },

  // 更新商品
  updateItem() {
    if (!this.validateItem()) return;
    
    const { formData, newItem, editingIndex } = this.data;
    const newItems = [...formData.items];
    
    newItems[editingIndex] = {
      ...newItems[editingIndex],
      ...newItem,
      amount: parseFloat(newItem.amount)
    };
    
    this.setData({
      'formData.items': newItems,
      showAddItem: false
    });
    
    this.calculateTotalAmount();
  },

  // 删除商品
  deleteItem(e) {
    const { index } = e.currentTarget.dataset;
    const { formData } = this.data;
    const newItems = [...formData.items];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: (res) => {
        if (res.confirm) {
          newItems.splice(index, 1);
          this.setData({
            'formData.items': newItems
          });
          this.calculateTotalAmount();
        }
      }
    });
  },

  // 计算总金额
  calculateTotalAmount() {
    const { items } = this.data.formData;
    const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    this.setData({
      'formData.totalAmount': total.toFixed(2)
    });
  },

  // 验证商品数据
  validateItem() {
    const { newItem } = this.data;
    const errors = {};
    
    if (!newItem.productName.trim()) {
      errors.productName = '请输入商品名称';
    }
    
    if (!newItem.quantity || newItem.quantity <= 0) {
      errors.quantity = '请输入有效数量';
    }
    
    if (!newItem.price || newItem.price <= 0) {
      errors.price = '请输入有效价格';
    }
    
    this.setData({
      itemErrors: errors
    });
    
    return Object.keys(errors).length === 0;
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    
    if (!formData.orderNo.trim()) {
      errors.orderNo = '请输入订单号';
    }
    
    if (!formData.customer.trim()) {
      errors.customer = '请输入客户姓名';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      errors.phone = '请输入有效的手机号码';
    }
    
    if (formData.items.length === 0) {
      errors.items = '请至少添加一个商品';
    }
    
    if (!formData.totalAmount || formData.totalAmount <= 0) {
      errors.totalAmount = '总金额必须大于0';
    }
    
    this.setData({
      errors
    });
    
    return Object.keys(errors).length === 0;
  },

  // 保存销售单
  saveSale() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查输入信息',
        icon: 'error'
      });
      return;
    }
    
    this.setData({
      submitting: true
    });
    
    // 模拟保存操作
    setTimeout(() => {
      // 这里应该调用API保存数据
      const { formData } = this.data;
      
      // 保存到本地存储（实际应用中应该保存到服务器）
      try {
        const sales = wx.getStorageSync('sales') || [];
        const existingIndex = sales.findIndex(s => s.id === this.data.originalData.id);
        
        const updatedSale = {
          ...this.data.originalData,
          ...formData,
          updateTime: new Date()
        };
        
        if (existingIndex >= 0) {
          sales[existingIndex] = updatedSale;
        } else {
          sales.push(updatedSale);
        }
        
        wx.setStorageSync('sales', sales);
        
        this.setData({
          submitting: false
        });
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        
      } catch (error) {
        console.error('保存失败:', error);
        this.setData({
          submitting: false
        });
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    }, 1000);
  },

  // 取消编辑
  cancelEdit() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？未保存的更改将丢失。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  // 重置表单
  resetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置表单吗？所有更改将恢复到原始状态。',
      success: (res) => {
        if (res.confirm) {
          this.initializeData(this.data.originalData);
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  }
});