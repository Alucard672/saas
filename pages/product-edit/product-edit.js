// pages/product-edit/product-edit.js
Page({
  data: {
    productId: '',
    originalData: {},
    formData: {
      name: '',
      code: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      description: '',
      unit: '',
      images: []
    },
    categories: [
      { id: 1, name: '手机' },
      { id: 2, name: '电脑' },
      { id: 3, name: '平板' },
      { id: 4, name: '配件' },
      { id: 5, name: '其他' }
    ],
    units: ['个', '件', '台', '套', '盒', '包'],
    categoryIndex: 0,
    unitIndex: 0,
    errors: {},
    submitting: false,
    hasChanges: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ productId: id });
      this.loadProductData(id);
    } else {
      wx.showToast({
        title: '商品ID不能为空',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载商品数据
  loadProductData(productId) {
    // 模拟从后端获取商品数据
    const mockProducts = [
      {
        id: '1',
        name: '苹果 iPhone 15',
        code: 'IP15001',
        category: '手机',
        price: 5999,
        cost: 4500,
        stock: 25,
        minStock: 10,
        description: '最新款苹果手机，性能强劲',
        unit: '台',
        images: ['/images/product1.jpg']
      },
      {
        id: '2',
        name: '华为 Mate 60',
        code: 'HW60001',
        category: '手机',
        price: 6999,
        cost: 5200,
        stock: 8,
        minStock: 10,
        description: '华为旗舰手机',
        unit: '台',
        images: ['/images/product2.jpg']
      },
      {
        id: '3',
        name: '小米 14',
        code: 'MI14001',
        category: '手机',
        price: 3999,
        cost: 3000,
        stock: 0,
        minStock: 5,
        description: '小米高性价比手机',
        unit: '台',
        images: ['/images/product3.jpg']
      },
      {
        id: '4',
        name: 'MacBook Pro',
        code: 'MBP001',
        category: '电脑',
        price: 12999,
        cost: 10000,
        stock: 15,
        minStock: 5,
        description: '苹果专业笔记本电脑',
        unit: '台',
        images: ['/images/product4.jpg']
      },
      {
        id: '5',
        name: 'iPad Air',
        code: 'IPA001',
        category: '平板',
        price: 4599,
        cost: 3500,
        stock: 3,
        minStock: 8,
        description: '苹果平板电脑',
        unit: '台',
        images: ['/images/product5.jpg']
      }
    ];

    const product = mockProducts.find(p => p.id === productId);
    
    if (product) {
      // 找到对应的分类和单位索引
      const categoryIndex = this.data.categories.findIndex(c => c.name === product.category);
      const unitIndex = this.data.units.findIndex(u => u === product.unit);

      this.setData({
        originalData: { ...product },
        formData: { ...product },
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        unitIndex: unitIndex >= 0 ? unitIndex : 0
      });
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: '',
      hasChanges: true
    });

    // 实时计算利润
    if (field === 'price' || field === 'cost') {
      this.calculateProfit();
    }
  },

  // 计算利润
  calculateProfit() {
    const { price, cost } = this.data.formData;
    const priceNum = parseFloat(price) || 0;
    const costNum = parseFloat(cost) || 0;
    const profit = priceNum - costNum;
    const profitRate = costNum > 0 ? ((profit / costNum) * 100).toFixed(2) : 0;

    this.setData({
      'formData.profit': profit,
      'formData.profitRate': profitRate
    });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    const category = this.data.categories[index];
    
    this.setData({
      categoryIndex: index,
      'formData.category': category.name,
      'errors.category': '',
      hasChanges: true
    });
  },

  // 单位选择
  onUnitChange(e) {
    const index = parseInt(e.detail.value);
    const unit = this.data.units[index];
    
    this.setData({
      unitIndex: index,
      'formData.unit': unit,
      'errors.unit': '',
      hasChanges: true
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.formData.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = [...this.data.formData.images, ...res.tempFiles.map(file => file.tempFilePath)];
        this.setData({
          'formData.images': images,
          hasChanges: true
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.formData.images.filter((_, i) => i !== index);
    this.setData({
      'formData.images': images,
      hasChanges: true
    });
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url,
      urls: this.data.formData.images
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let isValid = true;

    // 商品名称验证
    if (!formData.name.trim()) {
      errors.name = '请输入商品名称';
      isValid = false;
    } else if (formData.name.length > 50) {
      errors.name = '商品名称不能超过50个字符';
      isValid = false;
    }

    // 商品编码验证
    if (!formData.code.trim()) {
      errors.code = '请输入商品编码';
      isValid = false;
    } else if (formData.code.length > 20) {
      errors.code = '商品编码不能超过20个字符';
      isValid = false;
    }

    // 分类验证
    if (!formData.category) {
      errors.category = '请选择商品分类';
      isValid = false;
    }

    // 价格验证
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = '请输入有效的售价';
      isValid = false;
    }

    // 成本验证
    if (!formData.cost || parseFloat(formData.cost) < 0) {
      errors.cost = '请输入有效的成本价';
      isValid = false;
    }

    // 库存验证
    if (formData.stock === '' || parseInt(formData.stock) < 0) {
      errors.stock = '请输入有效的库存数量';
      isValid = false;
    }

    // 最低库存验证
    if (formData.minStock === '' || parseInt(formData.minStock) < 0) {
      errors.minStock = '请输入有效的最低库存';
      isValid = false;
    }

    // 单位验证
    if (!formData.unit) {
      errors.unit = '请选择商品单位';
      isValid = false;
    }

    this.setData({ errors });
    return isValid;
  },

  // 保存商品
  async saveProduct() {
    if (this.data.submitting) return;

    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查表单信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      // 返回上一页并刷新数据
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 重置表单
  resetForm() {
    if (!this.data.hasChanges) {
      wx.showToast({
        title: '没有需要重置的更改',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有更改吗？',
      success: (res) => {
        if (res.confirm) {
          const categoryIndex = this.data.categories.findIndex(c => c.name === this.data.originalData.category);
          const unitIndex = this.data.units.findIndex(u => u === this.data.originalData.unit);

          this.setData({
            formData: { ...this.data.originalData },
            categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
            unitIndex: unitIndex >= 0 ? unitIndex : 0,
            errors: {},
            hasChanges: false
          });

          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  // 取消编辑
  cancelEdit() {
    if (this.data.hasChanges) {
      wx.showModal({
        title: '确认取消',
        content: '您有未保存的更改，确定要取消编辑吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 页面卸载时的确认
  onUnload() {
    // 页面卸载时不需要额外处理，因为用户已经通过取消按钮确认过了
  }
});