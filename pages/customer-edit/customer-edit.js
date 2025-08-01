// pages/customer-edit/customer-edit.js
Page({
  data: {
    isEdit: false,
    customerId: null,
    customerData: {
      name: '',
      phone: '',
      type: '',
      address: '',
      creditLimit: '',
      paymentMethod: '',
      notes: ''
    },
    typeOptions: ['普通客户', 'VIP客户', '企业客户', '代理商'],
    typeIndex: 0,
    paymentMethodOptions: ['微信支付', '支付宝', '现金', '银行卡'],
    paymentMethodIndex: 0,
    paymentMethodIcons: [
      '/images/wechat-pay.png',
      '/images/alipay.png', 
      '/images/cash-pay.png',
      '/images/card-pay.png'
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        customerId: options.id
      });
      this.loadCustomerData(options.id);
    }
  },

  /**
   * 加载客户数据
   */
  loadCustomerData(customerId) {
    // 模拟从数据库加载客户数据
    const mockCustomer = {
      id: customerId,
      name: '张三',
      phone: '13800138000',
      type: 'VIP客户',
      address: '北京市朝阳区xxx街道xxx号',
      creditLimit: '50000',
      paymentMethod: '微信支付',
      notes: '重要客户，优先处理订单'
    };

    const typeIndex = this.data.typeOptions.indexOf(mockCustomer.type);
    const paymentMethodIndex = this.data.paymentMethodOptions.indexOf(mockCustomer.paymentMethod);

    this.setData({
      customerData: mockCustomer,
      typeIndex: typeIndex >= 0 ? typeIndex : 0,
      paymentMethodIndex: paymentMethodIndex >= 0 ? paymentMethodIndex : 0
    });
  },

  /**
   * 姓名输入
   */
  onNameInput(e) {
    this.setData({
      'customerData.name': e.detail.value
    });
  },

  /**
   * 电话输入
   */
  onPhoneInput(e) {
    this.setData({
      'customerData.phone': e.detail.value
    });
  },

  /**
   * 地址输入
   */
  onAddressInput(e) {
    this.setData({
      'customerData.address': e.detail.value
    });
  },

  /**
   * 信用额度输入
   */
  onCreditLimitInput(e) {
    this.setData({
      'customerData.creditLimit': e.detail.value
    });
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({
      'customerData.notes': e.detail.value
    });
  },

  /**
   * 客户类型选择
   */
  onTypeChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      typeIndex: index,
      'customerData.type': this.data.typeOptions[index]
    });
  },

  /**
   * 支付方式选择
   */
  onPaymentMethodChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      paymentMethodIndex: index,
      'customerData.paymentMethod': this.data.paymentMethodOptions[index]
    });
  },

  /**
   * 保存客户
   */
  onSave() {
    const { customerData } = this.data;
    
    // 验证必填字段
    if (!customerData.name.trim()) {
      wx.showToast({
        title: '请输入客户姓名',
        icon: 'none'
      });
      return;
    }

    if (!customerData.phone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(customerData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.isEdit ? '保存中...' : '添加中...'
    });

    // 模拟保存操作
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '添加成功',
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