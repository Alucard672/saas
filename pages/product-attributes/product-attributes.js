// pages/product-attributes/product-attributes.js
Page({
  data: {
    categories: [],
    selectedCategory: null,
    showCategoryModal: false,
    showAttributeModal: false,
    
    // 分类表单
    categoryForm: {
      id: '',
      name: '',
      description: '',
      parentId: null
    },
    categoryErrors: {},
    
    // 属性表单
    attributeForm: {
      id: '',
      name: '',
      type: 'text', // text, number, select, multiSelect, boolean, color, size
      required: false,
      options: [], // 用于select和multiSelect类型
      defaultValue: '',
      validation: {
        min: null,
        max: null,
        pattern: ''
      }
    },
    attributeErrors: {},
    
    // 属性类型选项
    attributeTypes: [
      { value: 'text', label: '文本' },
      { value: 'number', label: '数字' },
      { value: 'select', label: '单选' },
      { value: 'multiSelect', label: '多选' },
      { value: 'boolean', label: '是/否' },
      { value: 'color', label: '颜色' },
      { value: 'size', label: '尺寸' },
      { value: 'image', label: '图片' },
      { value: 'date', label: '日期' }
    ],
    attributeTypeIndex: 0, // 当前选中的属性类型索引
    
    // 预定义的商品分类模板
    categoryTemplates: {
      '服装': {
        attributes: [
          { name: '颜色', type: 'color', required: true },
          { name: '尺码', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          { name: '材质', type: 'text', required: false },
          { name: '季节', type: 'select', required: false, options: ['春', '夏', '秋', '冬'] },
          { name: '风格', type: 'select', required: false, options: ['休闲', '商务', '运动', '时尚'] }
        ]
      },
      '五金': {
        attributes: [
          { name: '型号', type: 'text', required: true },
          { name: '尺寸', type: 'text', required: true },
          { name: '材质', type: 'select', required: true, options: ['不锈钢', '铁', '铜', '铝合金', '塑料'] },
          { name: '重量', type: 'number', required: false },
          { name: '表面处理', type: 'select', required: false, options: ['镀锌', '喷塑', '阳极氧化', '抛光'] }
        ]
      },
      '电子产品': {
        attributes: [
          { name: '品牌', type: 'text', required: true },
          { name: '型号', type: 'text', required: true },
          { name: '颜色', type: 'color', required: false },
          { name: '内存', type: 'select', required: false, options: ['16GB', '32GB', '64GB', '128GB', '256GB'] },
          { name: '保修期', type: 'select', required: false, options: ['1年', '2年', '3年'] }
        ]
      },
      '食品': {
        attributes: [
          { name: '口味', type: 'select', required: false, options: ['原味', '甜味', '咸味', '辣味'] },
          { name: '包装规格', type: 'text', required: true },
          { name: '保质期', type: 'number', required: true },
          { name: '产地', type: 'text', required: false },
          { name: '是否有机', type: 'boolean', required: false }
        ]
      }
    },
    
    editingType: '', // 'category' 或 'attribute'
    editingIndex: -1
  },

  onLoad() {
    this.loadCategories();
  },

  // 加载分类数据
  loadCategories() {
    try {
      const categories = wx.getStorageSync('productCategories') || [];
      this.setData({ categories });
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  },

  // 保存分类数据
  saveCategories() {
    try {
      wx.setStorageSync('productCategories', this.data.categories);
    } catch (error) {
      console.error('保存分类失败:', error);
    }
  },

  // 选择分类
  selectCategory(e) {
    const { index } = e.currentTarget.dataset;
    const category = this.data.categories[index];
    this.setData({ selectedCategory: category });
  },

  // 显示分类弹窗
  showCategoryForm(e) {
    const { type, index } = e.currentTarget.dataset;
    
    if (type === 'add') {
      this.setData({
        showCategoryModal: true,
        editingType: 'category',
        editingIndex: -1,
        categoryForm: {
          id: '',
          name: '',
          description: '',
          parentId: null,
          attributes: []
        },
        categoryErrors: {}
      });
    } else if (type === 'edit') {
      const category = this.data.categories[index];
      this.setData({
        showCategoryModal: true,
        editingType: 'category',
        editingIndex: index,
        categoryForm: { ...category },
        categoryErrors: {}
      });
    }
  },

  // 隐藏分类弹窗
  hideCategoryModal() {
    this.setData({ showCategoryModal: false });
  },

  // 分类表单输入
  onCategoryInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`categoryForm.${field}`]: value,
      [`categoryErrors.${field}`]: ''
    });
  },

  // 应用分类模板
  applyCategoryTemplate(e) {
    const { template } = e.currentTarget.dataset;
    const templateData = this.data.categoryTemplates[template];
    
    if (templateData) {
      const attributes = templateData.attributes.map((attr, index) => ({
        id: `attr_${Date.now()}_${index}`,
        ...attr
      }));
      
      this.setData({
        'categoryForm.attributes': attributes
      });
      
      wx.showToast({
        title: `已应用${template}模板`,
        icon: 'success'
      });
    }
  },

  // 保存分类
  saveCategory() {
    if (!this.validateCategoryForm()) return;
    
    const { categories, categoryForm, editingIndex } = this.data;
    const newCategories = [...categories];
    
    if (editingIndex >= 0) {
      // 编辑现有分类
      newCategories[editingIndex] = {
        ...categoryForm,
        updateTime: new Date()
      };
    } else {
      // 添加新分类
      newCategories.push({
        ...categoryForm,
        id: `cat_${Date.now()}`,
        createTime: new Date(),
        attributes: categoryForm.attributes || []
      });
    }
    
    this.setData({
      categories: newCategories,
      showCategoryModal: false
    });
    
    this.saveCategories();
    
    wx.showToast({
      title: editingIndex >= 0 ? '分类已更新' : '分类已添加',
      icon: 'success'
    });
  },

  // 删除分类
  deleteCategory(e) {
    const { index } = e.currentTarget.dataset;
    const category = this.data.categories[index];
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const newCategories = [...this.data.categories];
          newCategories.splice(index, 1);
          
          this.setData({ categories: newCategories });
          this.saveCategories();
          
          wx.showToast({
            title: '分类已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示属性弹窗
  showAttributeForm(e) {
    const { type, index } = e.currentTarget.dataset;
    
    if (!this.data.selectedCategory) {
      wx.showToast({
        title: '请先选择分类',
        icon: 'none'
      });
      return;
    }
    
    if (type === 'add') {
      this.setData({
        showAttributeModal: true,
        editingType: 'attribute',
        editingIndex: -1,
        attributeTypeIndex: 0, // 默认选择第一个类型
        attributeForm: {
          id: '',
          name: '',
          type: 'text',
          required: false,
          options: [],
          defaultValue: '',
          validation: {
            min: null,
            max: null,
            pattern: ''
          }
        },
        attributeErrors: {}
      });
    } else if (type === 'edit') {
      const attribute = this.data.selectedCategory.attributes[index];
      const typeIndex = this.data.attributeTypes.findIndex(t => t.value === attribute.type);
      this.setData({
        showAttributeModal: true,
        editingType: 'attribute',
        editingIndex: index,
        attributeTypeIndex: typeIndex >= 0 ? typeIndex : 0,
        attributeForm: { ...attribute },
        attributeErrors: {}
      });
    }
  },

  // 隐藏属性弹窗
  hideAttributeModal() {
    this.setData({ showAttributeModal: false });
  },

  // 属性表单输入
  onAttributeInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`attributeForm.${field}`]: value,
      [`attributeErrors.${field}`]: ''
    });
  },

  // 属性类型选择
  onAttributeTypeChange(e) {
    const index = parseInt(e.detail.value);
    const type = this.data.attributeTypes[index].value;
    
    this.setData({
      attributeTypeIndex: index,
      'attributeForm.type': type,
      'attributeErrors.type': ''
    });
  },

  // 添加选项
  addOption() {
    const options = [...this.data.attributeForm.options];
    options.push('');
    
    this.setData({
      'attributeForm.options': options
    });
  },

  // 删除选项
  removeOption(e) {
    const { index } = e.currentTarget.dataset;
    const options = [...this.data.attributeForm.options];
    options.splice(index, 1);
    
    this.setData({
      'attributeForm.options': options
    });
  },

  // 选项输入
  onOptionInput(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    const options = [...this.data.attributeForm.options];
    options[index] = value;
    
    this.setData({
      'attributeForm.options': options
    });
  },

  // 保存属性
  saveAttribute() {
    if (!this.validateAttributeForm()) return;
    
    const { categories, selectedCategory, attributeForm, editingIndex } = this.data;
    const categoryIndex = categories.findIndex(c => c.id === selectedCategory.id);
    
    if (categoryIndex < 0) return;
    
    const newCategories = [...categories];
    const category = { ...newCategories[categoryIndex] };
    
    if (!category.attributes) {
      category.attributes = [];
    }
    
    if (editingIndex >= 0) {
      // 编辑现有属性
      category.attributes[editingIndex] = {
        ...attributeForm,
        updateTime: new Date()
      };
    } else {
      // 添加新属性
      category.attributes.push({
        ...attributeForm,
        id: `attr_${Date.now()}`,
        createTime: new Date()
      });
    }
    
    newCategories[categoryIndex] = category;
    
    this.setData({
      categories: newCategories,
      selectedCategory: category,
      showAttributeModal: false
    });
    
    this.saveCategories();
    
    wx.showToast({
      title: editingIndex >= 0 ? '属性已更新' : '属性已添加',
      icon: 'success'
    });
  },

  // 删除属性
  deleteAttribute(e) {
    const { index } = e.currentTarget.dataset;
    const { categories, selectedCategory } = this.data;
    const categoryIndex = categories.findIndex(c => c.id === selectedCategory.id);
    
    if (categoryIndex < 0) return;
    
    const attribute = selectedCategory.attributes[index];
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除属性"${attribute.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const newCategories = [...categories];
          const category = { ...newCategories[categoryIndex] };
          category.attributes.splice(index, 1);
          newCategories[categoryIndex] = category;
          
          this.setData({
            categories: newCategories,
            selectedCategory: category
          });
          
          this.saveCategories();
          
          wx.showToast({
            title: '属性已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 验证分类表单
  validateCategoryForm() {
    const { categoryForm } = this.data;
    const errors = {};
    
    if (!categoryForm.name.trim()) {
      errors.name = '请输入分类名称';
    }
    
    this.setData({ categoryErrors: errors });
    return Object.keys(errors).length === 0;
  },

  // 验证属性表单
  validateAttributeForm() {
    const { attributeForm } = this.data;
    const errors = {};
    
    if (!attributeForm.name.trim()) {
      errors.name = '请输入属性名称';
    }
    
    if (['select', 'multiSelect'].includes(attributeForm.type)) {
      if (!attributeForm.options || attributeForm.options.length === 0) {
        errors.options = '请添加选项';
      } else if (attributeForm.options.some(opt => !opt.trim())) {
        errors.options = '选项不能为空';
      }
    }
    
    this.setData({ attributeErrors: errors });
    return Object.keys(errors).length === 0;
  }
});