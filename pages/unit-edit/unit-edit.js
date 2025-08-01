// pages/unit-edit/unit-edit.js
Page({
  data: {
    unitId: null,
    originalData: null, // 保存原始数据作为参考
    formData: {
      name: '',
      symbol: '',
      description: '',
      isBase: false
    },
    errors: {},
    submitting: false,
    isEdit: false
  },

  onLoad(options) {
    console.log('单位编辑页面加载', options);
    
    if (options.id) {
      this.setData({
        unitId: options.id,
        isEdit: true
      });
      this.loadUnitData(options.id);
    }
  },

  // 加载单位数据
  loadUnitData(unitId) {
    wx.showLoading({
      title: '加载中...'
    });

    try {
      // 从本地存储获取单位数据
      const units = wx.getStorageSync('units') || [];
      const unit = units.find(item => item.id == unitId);
      
      if (unit) {
        // 保存原始数据
        const originalData = JSON.parse(JSON.stringify(unit));
        
        this.setData({
          originalData: originalData,
          formData: {
            name: unit.name || '',
            symbol: unit.symbol || '',
            description: unit.description || '',
            isBase: unit.isBase || false
          }
        });
      } else {
        wx.showToast({
          title: '单位不存在',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载单位数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 表单输入处理
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`errors.${field}`]: '' // 清除错误信息
    });
  },

  // 复选框变化处理
  onCheckboxChange(e) {
    const { value } = e.detail;
    this.setData({
      'formData.isBase': value.includes('isBase')
    });
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data;
    const errors = {};

    // 验证单位名称
    if (!formData.name || !formData.name.trim()) {
      errors.name = '请输入单位名称';
    } else if (formData.name.trim().length > 10) {
      errors.name = '单位名称不能超过10个字符';
    }

    // 验证单位符号
    if (formData.symbol && formData.symbol.length > 5) {
      errors.symbol = '单位符号不能超过5个字符';
    }

    // 验证描述
    if (formData.description && formData.description.length > 50) {
      errors.description = '单位描述不能超过50个字符';
    }

    // 检查单位名称是否重复（排除当前编辑的单位）
    try {
      const units = wx.getStorageSync('units') || [];
      const existingUnit = units.find(item => 
        item.name === formData.name.trim() && 
        item.id != this.data.unitId
      );
      
      if (existingUnit) {
        errors.name = '单位名称已存在';
      }
    } catch (error) {
      console.error('验证单位名称重复失败:', error);
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 保存单位
  saveUnit() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请检查输入信息',
        icon: 'error'
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      const { unitId, formData } = this.data;
      const units = wx.getStorageSync('units') || [];
      
      // 查找要编辑的单位
      const unitIndex = units.findIndex(item => item.id == unitId);
      
      if (unitIndex !== -1) {
        // 更新单位信息
        units[unitIndex] = {
          ...units[unitIndex],
          name: formData.name.trim(),
          symbol: formData.symbol.trim(),
          description: formData.description.trim(),
          isBase: formData.isBase,
          updateTime: new Date().toLocaleString()
        };

        // 保存到本地存储
        wx.setStorageSync('units', units);

        // 记录操作日志
        this.saveOperationLog('edit', unitId, `编辑单位: ${formData.name}`);

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error('单位不存在');
      }
    } catch (error) {
      console.error('保存单位失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 保存操作日志
  saveOperationLog(type, targetId, description) {
    try {
      const logs = wx.getStorageSync('operationLogs') || [];
      const newLog = {
        id: Date.now(),
        type: type,
        targetId: targetId,
        description: description,
        timestamp: new Date().toLocaleString(),
        operator: '当前用户' // 实际项目中应该是真实的用户信息
      };

      logs.unshift(newLog);
      
      // 只保留最近100条记录
      if (logs.length > 100) {
        logs.splice(100);
      }

      wx.setStorageSync('operationLogs', logs);
    } catch (error) {
      console.error('保存操作日志失败:', error);
    }
  },

  // 取消编辑
  cancelEdit() {
    // 检查是否有未保存的更改
    const { formData, originalData } = this.data;
    
    if (originalData && (
      formData.name !== originalData.name ||
      formData.symbol !== originalData.symbol ||
      formData.description !== originalData.description ||
      formData.isBase !== originalData.isBase
    )) {
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

  // 重置表单
  resetForm() {
    if (this.data.originalData) {
      wx.showModal({
        title: '确认重置',
        content: '确定要重置为原始数据吗？',
        success: (res) => {
          if (res.confirm) {
            const { originalData } = this.data;
            this.setData({
              formData: {
                name: originalData.name || '',
                symbol: originalData.symbol || '',
                description: originalData.description || '',
                isBase: originalData.isBase || false
              },
              errors: {}
            });
            
            wx.showToast({
              title: '已重置',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  // 页面生命周期函数--监听页面初次渲染完成
  onReady() {
    wx.setNavigationBarTitle({
      title: this.data.isEdit ? '编辑单位' : '新增单位'
    });
  },

  // 页面生命周期函数--监听页面显示
  onShow() {

  },

  // 页面生命周期函数--监听页面隐藏
  onHide() {

  },

  // 页面生命周期函数--监听页面卸载
  onUnload() {

  },

  // 页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh() {
    if (this.data.unitId) {
      this.loadUnitData(this.data.unitId);
    }
    wx.stopPullDownRefresh();
  },

  // 页面上拉触底事件的处理函数
  onReachBottom() {

  },

  // 用户点击右上角分享
  onShareAppMessage() {

  }
});