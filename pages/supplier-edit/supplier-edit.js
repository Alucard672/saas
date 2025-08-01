// pages/supplier-edit/supplier-edit.js
Page({
  data: {
    isEdit: false,
    supplierId: null,
    supplierData: {
      name: '',
      contactPerson: '',
      phone: '',
      type: '',
      address: '',
      creditRating: '',
      paymentCycle: '',
      paymentMethod: '',
      notes: ''
    },
    typeOptions: ['生产厂家', '贸易商', '代理商', '个体户'],
    typeIndex: 0,
    creditRatingOptions: ['AAA级', 'AA级', 'A级', 'B级', 'C级'],
    creditRatingIndex: 0,
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
        supplierId: options.id
      });
      this.loadSupplierData(options.id);
    }
  },

  /**
   * 加载供应商数据
   */
  loadSupplierData(supplierId) {
    // 模拟从数据库加载供应商数据
    const mockSupplier = {
      id: supplierId,
      name: '华强电子有限公司',
      contactPerson: '李经理',
      phone: '13900139000',
      type: '生产厂家',
      address: '深圳市福田区华强北路xxx号',
      creditRating: 'AA级',
      paymentCycle: '30',
      paymentMethod: '银行卡',
      notes: '长期合作伙伴，产品质量稳定'
    };

    const typeIndex = this.data.typeOptions.indexOf(mockSupplier.type);
    const creditRatingIndex = this.data.creditRatingOptions.indexOf(mockSupplier.creditRating);
    const paymentMethodIndex = this.data.paymentMethodOptions.indexOf(mockSupplier.paymentMethod);

    this.setData({
      supplierData: mockSupplier,
      typeIndex: typeIndex >= 0 ? typeIndex : 0,
      creditRatingIndex: creditRatingIndex >= 0 ? creditRatingIndex : 0,
      paymentMethodIndex: paymentMethodIndex >= 0 ? paymentMethodIndex : 0
    });
  },

  /**
   * 供应商名称输入
   */
  onNameInput(e) {
    this.setData({
      'supplierData.name': e.detail.value
    });
  },

  /**
   * 联系人输入
   */
  onContactPersonInput(e) {
    this.setData({
      'supplierData.contactPerson': e.detail.value
    });
  },

  /**
   * 电话输入
   */
  onPhoneInput(e) {
    this.setData({
      'supplierData.phone': e.detail.value
    });
  },

  /**
   * 地址输入
   */
  onAddressInput(e) {
    this.setData({
      'supplierData.address': e.detail.value
    });
  },

  /**
   * 付款周期输入
   */
  onPaymentCycleInput(e) {
    this.setData({
      'supplierData.paymentCycle': e.detail.value
    });
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({
      'supplierData.notes': e.detail.value
    });
  },

  /**
   * 供应商类型选择
   */
  onTypeChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      typeIndex: index,
      'supplierData.type': this.data.typeOptions[index]
    });
  },

  /**
   * 信用等级选择
   */
  onCreditRatingChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      creditRatingIndex: index,
      'supplierData.creditRating': this.data.creditRatingOptions[index]
    });
  },

  /**
   * 结算方式选择
   */
  onPaymentMethodChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      paymentMethodIndex: index,
      'supplierData.paymentMethod': this.data.paymentMethodOptions[index]
    });
  },

  /**
   * 保存供应商
   */
  onSave() {
    const { supplierData } = this.data;
    
    // 验证必填字段
    if (!supplierData.name.trim()) {
      wx.showToast({
        title: '请输入供应商名称',
        icon: 'none'
      });
      return;
    }

    if (!supplierData.contactPerson.trim()) {
      wx.showToast({
        title: '请输入联系人',
        icon: 'none'
      });
      return;
    }

    if (!supplierData.phone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(supplierData.phone)) {
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