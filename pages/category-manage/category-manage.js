// pages/category-manage/category-manage.js
Page({
  data: {
    categories: [],
    showAddModal: false,
    showEditModal: false,
    currentCategory: null,
    formData: {
      name: '',
      parentId: '',
      sort: 0,
      description: ''
    },
    parentCategories: [],
    errors: {},
    submitting: false,
    expandedItems: {}
  },

  onLoad() {
    this.loadCategories();
  },

  onShow() {
    this.loadCategories();
  },

  // 加载分类数据
  loadCategories() {
    // 模拟分类数据（支持多级分类）
    const mockCategories = [
      {
        id: '1',
        name: '电子产品',
        parentId: '',
        level: 1,
        sort: 1,
        description: '各类电子设备',
        createTime: '2024-01-15',
        children: [
          {
            id: '11',
            name: '手机',
            parentId: '1',
            level: 2,
            sort: 1,
            description: '智能手机',
            createTime: '2024-01-15',
            children: []
          },
          {
            id: '12',
            name: '电脑',
            parentId: '1',
            level: 2,
            sort: 2,
            description: '笔记本电脑、台式机',
            createTime: '2024-01-15',
            children: []
          }
        ]
      },
      {
        id: '2',
        name: '服装鞋帽',
        parentId: '',
        level: 1,
        sort: 2,
        description: '服装类商品',
        createTime: '2024-01-14',
        children: [
          {
            id: '21',
            name: '男装',
            parentId: '2',
            level: 2,
            sort: 1,
            description: '男士服装',
            createTime: '2024-01-14',
            children: []
          },
          {
            id: '22',
            name: '女装',
            parentId: '2',
            level: 2,
            sort: 2,
            description: '女士服装',
            createTime: '2024-01-14',
            children: []
          }
        ]
      },
      {
        id: '3',
        name: '家居用品',
        parentId: '',
        level: 1,
        sort: 3,
        description: '家庭日用品',
        createTime: '2024-01-13',
        children: []
      }
    ];

    // 构建父级分类选项
    const parentCategories = this.buildParentOptions(mockCategories);

    this.setData({
      categories: mockCategories,
      parentCategories
    });
  },

  // 构建父级分类选项
  buildParentOptions(categories, level = 0, prefix = '') {
    let options = [{ id: '', name: '无（作为顶级分类）' }];
    
    categories.forEach(category => {
      const name = prefix + category.name;
      options.push({
        id: category.id,
        name: name,
        level: level
      });
      
      if (category.children && category.children.length > 0) {
        const childOptions = this.buildParentOptions(
          category.children, 
          level + 1, 
          prefix + '　'
        );
        options = options.concat(childOptions.slice(1)); // 去掉子级的"无"选项
      }
    });
    
    return options;
  },

  // 展开/收起分类
  toggleExpand(e) {
    const { id } = e.currentTarget.dataset;
    const expandedItems = { ...this.data.expandedItems };
    expandedItems[id] = !expandedItems[id];
    
    this.setData({
      expandedItems
    });
  },

  // 显示添加分类弹窗
  showAddCategory() {
    this.setData({
      showAddModal: true,
      formData: {
        name: '',
        parentId: '',
        sort: 0,
        description: ''
      },
      errors: {}
    });
  },

  // 显示编辑分类弹窗
  showEditCategory(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({
      showEditModal: true,
      currentCategory: category,
      formData: {
        name: category.name,
        parentId: category.parentId,
        sort: category.sort,
        description: category.description
      },
      errors: {}
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showAddModal: false,
      showEditModal: false,
      currentCategory: null,
      formData: {
        name: '',
        parentId: '',
        sort: 0,
        description: ''
      },
      errors: {}
    });
  },

  // 表单输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: ''
    });
  },

  // 父级分类选择
  onParentChange(e) {
    const index = parseInt(e.detail.value);
    const parentId = this.data.parentCategories[index].id;
    
    this.setData({
      'formData.parentId': parentId,
      'errors.parentId': ''
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = '请输入分类名称';
      isValid = false;
    } else if (formData.name.length > 20) {
      errors.name = '分类名称不能超过20个字符';
      isValid = false;
    }

    if (formData.sort !== '' && (isNaN(formData.sort) || parseInt(formData.sort) < 0)) {
      errors.sort = '请输入有效的排序值';
      isValid = false;
    }

    this.setData({ errors });
    return isValid;
  },

  // 添加分类
  async addCategory() {
    if (this.data.submitting) return;

    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      // 模拟添加分类
      const newCategory = {
        id: Date.now().toString(),
        ...this.data.formData,
        level: this.data.formData.parentId ? 2 : 1,
        createTime: new Date().toISOString().split('T')[0],
        children: []
      };

      // 更新分类列表
      const categories = [...this.data.categories];
      if (newCategory.parentId) {
        // 添加到父级分类下
        this.addToParent(categories, newCategory);
      } else {
        // 添加为顶级分类
        categories.push(newCategory);
      }

      // 重新构建父级分类选项
      const parentCategories = this.buildParentOptions(categories);

      this.setData({
        categories,
        parentCategories
      });

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      this.hideModal();

    } catch (error) {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 更新分类
  async updateCategory() {
    if (this.data.submitting) return;

    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const { currentCategory, formData } = this.data;
      const categories = [...this.data.categories];
      
      // 更新分类信息
      this.updateInCategories(categories, currentCategory.id, formData);

      // 重新构建父级分类选项
      const parentCategories = this.buildParentOptions(categories);

      this.setData({
        categories,
        parentCategories
      });

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });

      this.hideModal();

    } catch (error) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 删除分类
  deleteCategory(e) {
    const { category } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除分类"${category.name}"吗？删除后该分类下的子分类也会被删除。`,
      success: (res) => {
        if (res.confirm) {
          const categories = [...this.data.categories];
          this.removeFromCategories(categories, category.id);
          
          // 重新构建父级分类选项
          const parentCategories = this.buildParentOptions(categories);
          
          this.setData({
            categories,
            parentCategories
          });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 辅助方法：添加到父级分类
  addToParent(categories, newCategory) {
    for (let category of categories) {
      if (category.id === newCategory.parentId) {
        category.children.push(newCategory);
        return true;
      }
      if (category.children && this.addToParent(category.children, newCategory)) {
        return true;
      }
    }
    return false;
  },

  // 辅助方法：更新分类
  updateInCategories(categories, id, formData) {
    for (let category of categories) {
      if (category.id === id) {
        Object.assign(category, formData);
        return true;
      }
      if (category.children && this.updateInCategories(category.children, id, formData)) {
        return true;
      }
    }
    return false;
  },

  // 辅助方法：删除分类
  removeFromCategories(categories, id) {
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].id === id) {
        categories.splice(i, 1);
        return true;
      }
      if (categories[i].children && this.removeFromCategories(categories[i].children, id)) {
        return true;
      }
    }
    return false;
  }
});