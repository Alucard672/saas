// pages/product-add/product-add.js
Page({
  data: {
    // 表单数据
    formData: {
      name: '',
      category: '',
      price: '',
      costPrice: '',
      stock: '',
      unit: '',
      barcode: '',
      description: '',
      attributes: {} // 动态属性数据
    },
    
    // 分类选项
    categories: [
      '电子产品',
      '服装鞋帽',
      '家居用品',
      '食品饮料',
      '美妆护肤',
      '运动户外',
      '图书文具',
      '其他'
    ],
    categoryIndex: -1,
    
    // 单位选项
    units: ['件', '个', '盒', '包', '瓶', '袋', '套', '台', '本', '支'],
    unitIndex: 0,
    
    // 图片上传
    imageList: [],
    showImageUpload: false,
    maxImageCount: 9,
    
    // 富文本编辑器
    editorReady: false,
    
    // 表单验证
    errors: {},
    
    // 提交状态
    submitting: false
  },

  onLoad(options) {
    // 初始化编辑器
    this.initEditor();
  },

  onReady() {
    // 页面渲染完成
  },

  // 初始化富文本编辑器
  initEditor() {
    const that = this;
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;
      that.setData({
        editorReady: true
      });
    }).exec();
  },

  // 表单输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: '' // 清除错误信息
    });
  },

  // 分类选择
  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categories[index],
      'errors.category': '',
      'formData.attributes': {} // 清空之前的属性数据
    });
    
    // 通知动态属性组件分类已改变
    const dynamicAttributesComponent = this.selectComponent('#dynamic-attributes');
    if (dynamicAttributesComponent) {
      dynamicAttributesComponent.onCategoryChange(this.data.categories[index]);
    }
  },

  // 单位选择
  onUnitChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      unitIndex: index,
      'formData.unit': this.data.units[index]
    });
  },

  // 处理动态属性数据变化
  onAttributesChange(e) {
    const { values } = e.detail;
    this.setData({
      'formData.attributes': values
    });
    this.setData({
      'formData.attributes': values
    });
  },

  // 显示图片上传界面
  showImageUploadModal() {
    this.setData({
      showImageUpload: true
    });
  },

  // 隐藏图片上传界面
  hideImageUploadModal() {
    this.setData({
      showImageUpload: false
    });
  },

  // 选择图片
  chooseImage() {
    const { imageList, maxImageCount } = this.data;
    const remainCount = maxImageCount - imageList.length;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: `最多只能上传${maxImageCount}张图片`,
        icon: 'none'
      });
      return;
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(file => ({
          url: file.tempFilePath,
          size: file.size
        }));
        
        this.setData({
          imageList: [...imageList, ...newImages]
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { imageList } = this.data;
    
    wx.previewImage({
      current: imageList[index].url,
      urls: imageList.map(img => img.url)
    });
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const { imageList } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          imageList.splice(index, 1);
          this.setData({
            imageList: [...imageList]
          });
        }
      }
    });
  },

  // 富文本编辑器获得焦点
  onEditorFocus() {
    // 编辑器获得焦点时的处理
  },

  // 富文本编辑器失去焦点
  onEditorBlur() {
    // 编辑器失去焦点时的处理
  },

  // 富文本编辑器内容变化
  onEditorInput(e) {
    // 可以在这里处理编辑器内容变化
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

    // 分类验证
    if (!formData.category) {
      errors.category = '请选择商品分类';
      isValid = false;
    }

    // 价格验证
    if (!formData.price) {
      errors.price = '请输入销售价格';
      isValid = false;
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = '请输入有效的价格';
      isValid = false;
    }

    // 成本价验证
    if (formData.costPrice && (isNaN(formData.costPrice) || parseFloat(formData.costPrice) < 0)) {
      errors.costPrice = '请输入有效的成本价';
      isValid = false;
    }

    // 库存验证
    if (!formData.stock) {
      errors.stock = '请输入库存数量';
      isValid = false;
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      errors.stock = '请输入有效的库存数量';
      isValid = false;
    }

    this.setData({ errors });
    return isValid;
  },

  // 获取富文本内容
  getEditorContent() {
    return new Promise((resolve) => {
      if (this.editorCtx) {
        this.editorCtx.getContents({
          success: (res) => {
            resolve(res.html);
          },
          fail: () => {
            resolve('');
          }
        });
      } else {
        resolve('');
      }
    });
  },

  // 提交表单
  async submitForm() {
    if (this.data.submitting) return;

    // 表单验证
    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查表单信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 获取富文本内容
      const description = await this.getEditorContent();
      
      // 构建提交数据
      const submitData = {
        ...this.data.formData,
        description,
        images: this.data.imageList.map(img => img.url),
        createTime: new Date().toISOString()
      };

      // 模拟提交到服务器
      await this.mockSubmit(submitData);

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      wx.showToast({
        title: '添加失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 模拟提交数据
  mockSubmit(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟网络请求
        if (Math.random() > 0.1) { // 90% 成功率
          console.log('提交的商品数据:', data);
          resolve(data);
        } else {
          reject(new Error('网络错误'));
        }
      }, 1000);
    });
  },

  // 取消操作
  cancelForm() {
    const { formData, imageList } = this.data;
    const hasData = Object.values(formData).some(value => {
      if (typeof value === 'string') {
        return value.trim();
      } else if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value;
    }) || imageList.length > 0;

    if (hasData) {
      wx.showModal({
        title: '确认取消',
        content: '当前有未保存的内容，确定要取消吗？',
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

  // 重置表单
  resetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              name: '',
              category: '',
              price: '',
              costPrice: '',
              stock: '',
              unit: '',
              barcode: '',
              description: '',
              attributes: {}
            },
            categoryIndex: -1,
            unitIndex: 0,
            imageList: [],
            errors: {}
          });

          // 清空富文本编辑器
          if (this.editorCtx) {
            this.editorCtx.clear();
          }

          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  }
});