// pages/unit-manage/unit-manage.js
Page({
  data: {
    currentTab: 0,
    searchKeyword: '',
    units: [],
    filteredUnits: [],
    showAddModal: false,
    showEditModal: false,
    showConversionModal: false,
    showModal: false,
    isEdit: false,
    isEditConversion: false,
    currentUnit: null,
    formData: {
      name: '',
      symbol: '',
      description: '',
      isBase: false
    },
    conversionData: {
      fromUnit: '',
      toUnit: '',
      ratio: 1,
      description: ''
    },
    conversions: [],
    errors: {},
    conversionErrors: {},
    submitting: false,
    submittingConversion: false,
    fromUnitIndex: -1,
    toUnitIndex: -1
  },

  onLoad() {
    this.loadUnits();
    this.loadConversions();
  },

  onShow() {
    this.loadUnits();
    this.loadConversions();
  },

  // 切换标签页
  switchTab(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      currentTab: parseInt(index)
    });
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterUnits();
  },

  // 搜索
  onSearch() {
    this.filterUnits();
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.filterUnits();
  },

  // 过滤单位
  filterUnits() {
    const { units, searchKeyword } = this.data;
    let filteredUnits = units;

    if (searchKeyword.trim()) {
      filteredUnits = units.filter(unit => 
        unit.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (unit.symbol && unit.symbol.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (unit.description && unit.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    this.setData({
      filteredUnits
    });
  },

  // 加载单位数据
  loadUnits() {
    // 模拟单位数据
    const mockUnits = [
      {
        id: '1',
        name: '个',
        symbol: '个',
        description: '基本计数单位',
        isBase: true,
        createTime: '2024-01-15',
        usageCount: 25
      },
      {
        id: '2',
        name: '千克',
        symbol: 'kg',
        description: '重量单位',
        isBase: true,
        createTime: '2024-01-15',
        usageCount: 18
      },
      {
        id: '3',
        name: '克',
        symbol: 'g',
        description: '重量单位',
        isBase: false,
        createTime: '2024-01-15',
        usageCount: 12
      },
      {
        id: '4',
        name: '米',
        symbol: 'm',
        description: '长度单位',
        isBase: true,
        createTime: '2024-01-14',
        usageCount: 8
      },
      {
        id: '5',
        name: '厘米',
        symbol: 'cm',
        description: '长度单位',
        isBase: false,
        createTime: '2024-01-14',
        usageCount: 15
      },
      {
        id: '6',
        name: '升',
        symbol: 'L',
        description: '体积单位',
        isBase: true,
        createTime: '2024-01-13',
        usageCount: 6
      },
      {
        id: '7',
        name: '毫升',
        symbol: 'ml',
        description: '体积单位',
        isBase: false,
        createTime: '2024-01-13',
        usageCount: 9
      }
    ];

    this.setData({
      units: mockUnits,
      filteredUnits: mockUnits
    });
  },

  // 加载换算关系数据
  loadConversions() {
    // 模拟换算关系数据
    const mockConversions = [
      {
        id: '1',
        fromUnit: '千克',
        fromUnitId: '2',
        toUnit: '克',
        toUnitId: '3',
        ratio: 1000,
        description: '1千克 = 1000克',
        createTime: '2024-01-15'
      },
      {
        id: '2',
        fromUnit: '米',
        fromUnitId: '4',
        toUnit: '厘米',
        toUnitId: '5',
        ratio: 100,
        description: '1米 = 100厘米',
        createTime: '2024-01-14'
      },
      {
        id: '3',
        fromUnit: '升',
        fromUnitId: '6',
        toUnit: '毫升',
        toUnitId: '7',
        ratio: 1000,
        description: '1升 = 1000毫升',
        createTime: '2024-01-13'
      }
    ];

    this.setData({
      conversions: mockConversions
    });
  },

  // 显示添加单位弹窗
  showAddUnit() {
    this.setData({
      showModal: true,
      isEdit: false,
      formData: {
        name: '',
        symbol: '',
        description: '',
        isBase: false
      },
      errors: {}
    });
  },

  // 显示添加弹窗
  showAddModal() {
    this.showAddUnit();
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: ''
    });
  },

  // 复选框变化
  onCheckboxChange(e) {
    const values = e.detail.value;
    this.setData({
      'formData.isBase': values.includes('isBase')
    });
  },

  // 提交表单
  submitForm() {
    if (this.data.isEdit) {
      this.updateUnit();
    } else {
      this.addUnit();
    }
  },

  // 跳转到编辑单位页面
  showEditUnit(e) {
    const { unit } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/unit-edit/unit-edit?id=${unit.id}&name=${encodeURIComponent(unit.name)}&symbol=${encodeURIComponent(unit.symbol)}&description=${encodeURIComponent(unit.description || '')}&isBase=${unit.isBase}`
    });
  },

  // 显示换算关系弹窗
  showConversionModal() {
    this.setData({
      showConversionModal: true,
      conversionData: {
        fromUnit: '',
        toUnit: '',
        ratio: 1,
        description: ''
      },
      errors: {}
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false,
      showAddModal: false,
      showEditModal: false,
      showConversionModal: false,
      isEdit: false,
      isEditConversion: false,
      currentUnit: null,
      formData: {
        name: '',
        symbol: '',
        description: '',
        isBase: false
      },
      conversionData: {
        fromUnit: '',
        toUnit: '',
        ratio: 1,
        description: ''
      },
      errors: {},
      conversionErrors: {}
    });
  },

  // 隐藏换算关系弹窗
  hideConversionModal() {
    this.setData({
      showConversionModal: false,
      isEditConversion: false,
      conversionData: {
        fromUnit: '',
        toUnit: '',
        ratio: 1,
        description: ''
      },
      conversionErrors: {},
      fromUnitIndex: -1,
      toUnitIndex: -1
    });
  },

  // 换算关系输入处理
  onConversionInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`conversionData.${field}`]: value,
      [`conversionErrors.${field}`]: ''
    });
  },

  // 源单位选择
  onFromUnitChange(e) {
    const index = parseInt(e.detail.value);
    const unit = this.data.units[index];
    
    this.setData({
      fromUnitIndex: index,
      'conversionData.fromUnit': unit.id,
      'conversionErrors.fromUnit': ''
    });
  },

  // 目标单位选择
  onToUnitChange(e) {
    const index = parseInt(e.detail.value);
    const unit = this.data.units[index];
    
    this.setData({
      toUnitIndex: index,
      'conversionData.toUnit': unit.id,
      'conversionErrors.toUnit': ''
    });
  },

  // 提交换算关系表单
  submitConversionForm() {
    this.addConversion();
  },

  // 编辑换算关系
  editConversion(e) {
    const { item } = e.currentTarget.dataset;
    // 这里可以添加编辑换算关系的逻辑
    wx.showToast({
      title: '编辑换算关系功能开发中',
      icon: 'none'
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

  // 换算表单输入处理
  onConversionInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`conversionData.${field}`]: value,
      [`errors.${field}`]: ''
    });
  },

  // 基本单位开关
  onBaseUnitChange(e) {
    this.setData({
      'formData.isBase': e.detail.value
    });
  },

  // 单位选择器
  onUnitChange(e) {
    const { field } = e.currentTarget.dataset;
    const index = parseInt(e.detail.value);
    const unit = this.data.units[index];
    
    this.setData({
      [`conversionData.${field}`]: unit.id,
      [`errors.${field}`]: ''
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = '请输入单位名称';
      isValid = false;
    } else if (formData.name.length > 10) {
      errors.name = '单位名称不能超过10个字符';
      isValid = false;
    }

    if (!formData.symbol.trim()) {
      errors.symbol = '请输入单位符号';
      isValid = false;
    } else if (formData.symbol.length > 5) {
      errors.symbol = '单位符号不能超过5个字符';
      isValid = false;
    }

    this.setData({ errors });
    return isValid;
  },

  // 换算关系验证
  validateConversion() {
    const { conversionData } = this.data;
    const errors = {};
    let isValid = true;

    if (!conversionData.fromUnit) {
      errors.fromUnit = '请选择源单位';
      isValid = false;
    }

    if (!conversionData.toUnit) {
      errors.toUnit = '请选择目标单位';
      isValid = false;
    }

    if (conversionData.fromUnit === conversionData.toUnit) {
      errors.toUnit = '源单位和目标单位不能相同';
      isValid = false;
    }

    if (!conversionData.ratio || conversionData.ratio <= 0) {
      errors.ratio = '请输入有效的换算比例';
      isValid = false;
    }

    this.setData({ errors });
    return isValid;
  },

  // 添加单位
  async addUnit() {
    if (this.data.submitting) return;

    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const newUnit = {
        id: Date.now().toString(),
        ...this.data.formData,
        createTime: new Date().toISOString().split('T')[0],
        usageCount: 0
      };

      const units = [...this.data.units, newUnit];

      this.setData({ units });

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

  // 更新单位
  async updateUnit() {
    if (this.data.submitting) return;

    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const { currentUnit, formData } = this.data;
      const units = this.data.units.map(unit => {
        if (unit.id === currentUnit.id) {
          return { ...unit, ...formData };
        }
        return unit;
      });

      this.setData({ units });

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

  // 删除单位
  deleteUnit(e) {
    const { unit } = e.currentTarget.dataset;
    
    if (unit.usageCount > 0) {
      wx.showModal({
        title: '无法删除',
        content: `该单位已被 ${unit.usageCount} 个商品使用，无法删除。请先修改相关商品的单位设置。`,
        showCancel: false
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除单位"${unit.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const units = this.data.units.filter(u => u.id !== unit.id);
          
          this.setData({ units });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 添加换算关系
  async addConversion() {
    if (this.data.submitting) return;

    if (!this.validateConversion()) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const { conversionData, units } = this.data;
      const fromUnit = units.find(u => u.id === conversionData.fromUnit);
      const toUnit = units.find(u => u.id === conversionData.toUnit);

      const newConversion = {
        id: Date.now().toString(),
        fromUnit: fromUnit.name,
        fromUnitId: fromUnit.id,
        toUnit: toUnit.name,
        toUnitId: toUnit.id,
        ratio: parseFloat(conversionData.ratio),
        description: conversionData.description || `1${fromUnit.name} = ${conversionData.ratio}${toUnit.name}`,
        createTime: new Date().toISOString().split('T')[0]
      };

      const conversions = [...this.data.conversions, newConversion];

      this.setData({ conversions });

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

  // 删除换算关系
  deleteConversion(e) {
    const { conversion } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除换算关系"${conversion.description}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const conversions = this.data.conversions.filter(c => c.id !== conversion.id);
          
          this.setData({ conversions });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUnits();
    this.loadConversions();
    wx.stopPullDownRefresh();
  }
});