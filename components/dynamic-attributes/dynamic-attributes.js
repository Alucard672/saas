// components/dynamic-attributes/dynamic-attributes.js
Component({
  properties: {
    category: {
      type: String,
      value: '',
      observer: 'onCategoryChange'
    },
    attributes: {
      type: Object,
      value: {},
      observer: 'onValuesChange'
    },
    readonly: {
      type: Boolean,
      value: false
    }
  },

  data: {
    attributes: [],
    attributeValues: {},
    errors: {}
  },

  methods: {
    // 分类变化时加载属性配置
    onCategoryChange(newCategory) {
      if (newCategory) {
        this.loadCategoryAttributes(newCategory);
      } else {
        this.setData({
          attributes: [],
          attributeValues: {},
          errors: {}
        });
      }
    },

    // 属性值变化时更新内部状态
    onValuesChange(newValues) {
      this.setData({
        attributeValues: newValues || {}
      });
    },

    // 加载分类属性配置
    loadCategoryAttributes(categoryName) {
      try {
        // 获取预定义的分类属性配置
        const categoryAttributes = this.getCategoryAttributesConfig(categoryName);
        
        if (categoryAttributes && categoryAttributes.length > 0) {
          // 初始化属性值
          const attributeValues = { ...this.data.attributeValues };
          categoryAttributes.forEach(attr => {
            if (attributeValues[attr.id] === undefined) {
              attributeValues[attr.id] = attr.defaultValue || this.getDefaultValueByType(attr.type);
            }
          });

          this.setData({
            attributes: categoryAttributes,
            attributeValues
          });

          // 触发父组件更新
          this.triggerEvent('attributeschange', {
            attributes: categoryAttributes,
            values: attributeValues
          });
        } else {
          // 如果没有找到配置，清空属性
          this.setData({
            attributes: [],
            attributeValues: {},
            errors: {}
          });
        }
      } catch (error) {
        console.error('加载分类属性失败:', error);
      }
    },

    // 获取分类属性配置
    getCategoryAttributesConfig(categoryName) {
      const attributesConfig = {
        '服装鞋帽': [
          {
            id: 'color',
            name: '颜色',
            type: 'color',
            required: true,
            description: '商品颜色'
          },
          {
            id: 'size',
            name: '尺码',
            type: 'size',
            required: true,
            options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            description: '服装尺码'
          },
          {
            id: 'material',
            name: '材质',
            type: 'select',
            required: false,
            options: ['棉', '麻', '丝绸', '羊毛', '化纤', '混纺'],
            description: '服装材质'
          },
          {
            id: 'season',
            name: '适用季节',
            type: 'multiSelect',
            required: false,
            options: ['春', '夏', '秋', '冬'],
            description: '适合穿着的季节'
          }
        ],
        '电子产品': [
          {
            id: 'brand',
            name: '品牌',
            type: 'select',
            required: true,
            options: ['苹果', '华为', '小米', '三星', '联想', '戴尔', '其他'],
            description: '产品品牌'
          },
          {
            id: 'model',
            name: '型号',
            type: 'text',
            required: true,
            description: '具体型号'
          },
          {
            id: 'memory',
            name: '内存容量',
            type: 'select',
            required: false,
            options: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB'],
            description: '设备内存'
          },
          {
            id: 'storage',
            name: '存储容量',
            type: 'select',
            required: false,
            options: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
            description: '存储空间'
          },
          {
            id: 'warranty',
            name: '保修期',
            type: 'select',
            required: false,
            options: ['1年', '2年', '3年', '5年'],
            description: '保修时长'
          }
        ],
        '家居用品': [
          {
            id: 'material',
            name: '材质',
            type: 'select',
            required: true,
            options: ['木质', '金属', '塑料', '玻璃', '陶瓷', '布艺', '皮质'],
            description: '产品材质'
          },
          {
            id: 'dimensions',
            name: '尺寸',
            type: 'text',
            required: false,
            description: '长x宽x高 (cm)'
          },
          {
            id: 'weight',
            name: '重量',
            type: 'number',
            required: false,
            description: '产品重量 (kg)'
          },
          {
            id: 'style',
            name: '风格',
            type: 'select',
            required: false,
            options: ['现代简约', '欧式', '中式', '美式', '北欧', '工业风'],
            description: '设计风格'
          }
        ],
        '食品饮料': [
          {
            id: 'brand',
            name: '品牌',
            type: 'text',
            required: true,
            description: '食品品牌'
          },
          {
            id: 'specification',
            name: '规格',
            type: 'text',
            required: true,
            description: '包装规格'
          },
          {
            id: 'productionDate',
            name: '生产日期',
            type: 'date',
            required: false,
            description: '生产日期'
          },
          {
            id: 'shelfLife',
            name: '保质期',
            type: 'select',
            required: true,
            options: ['7天', '15天', '30天', '3个月', '6个月', '12个月', '18个月', '24个月'],
            description: '保质期限'
          },
          {
            id: 'storage',
            name: '储存条件',
            type: 'select',
            required: false,
            options: ['常温', '冷藏', '冷冻', '阴凉干燥'],
            description: '储存要求'
          }
        ]
      };

      return attributesConfig[categoryName] || [];
    },

    // 根据类型获取默认值
    getDefaultValueByType(type) {
      switch (type) {
        case 'number':
          return 0;
        case 'boolean':
          return false;
        case 'select':
        case 'multiSelect':
          return [];
        default:
          return '';
      }
    },

    // 处理文本输入
    onTextInput(e) {
      const { id } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.updateAttributeValue(id, value);
    },

    // 处理数字输入
    onNumberInput(e) {
      const { id } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.updateAttributeValue(id, parseFloat(value) || 0);
    },

    // 处理选择器变化
    onPickerChange(e) {
      const { id, options } = e.currentTarget.dataset;
      const index = parseInt(e.detail.value);
      const value = options[index];
      this.updateAttributeValue(id, value);
    },

    // 处理多选变化
    onCheckboxChange(e) {
      const { id } = e.currentTarget.dataset;
      const values = e.detail.value;
      this.updateAttributeValue(id, values);
    },

    // 处理开关变化
    onSwitchChange(e) {
      const { id } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.updateAttributeValue(id, value);
    },

    // 处理颜色选择
    onColorSelect(e) {
      const { id, color } = e.currentTarget.dataset;
      this.updateAttributeValue(id, color);
    },

    // 处理尺寸选择
    onSizeSelect(e) {
      const { id, size } = e.currentTarget.dataset;
      this.updateAttributeValue(id, size);
    },

    // 处理图片上传
    onImageUpload(e) {
      const { id } = e.currentTarget.dataset;
      
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.updateAttributeValue(id, tempFilePath);
        }
      });
    },

    // 处理日期选择
    onDateChange(e) {
      const { id } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.updateAttributeValue(id, value);
    },

    // 更新属性值
    updateAttributeValue(attributeId, value) {
      const attributeValues = { ...this.data.attributeValues };
      attributeValues[attributeId] = value;

      // 清除该字段的错误
      const errors = { ...this.data.errors };
      delete errors[attributeId];

      this.setData({
        attributeValues,
        errors
      });

      // 触发父组件更新
      this.triggerEvent('attributeschange', {
        values: attributeValues
      });
    },

    // 验证所有属性
    validateAttributes() {
      const { attributes, attributeValues } = this.data;
      const errors = {};

      attributes.forEach(attr => {
        const value = attributeValues[attr.id];
        const error = this.validateAttribute(attr, value);
        if (error) {
          errors[attr.id] = error;
        }
      });

      this.setData({ errors });

      // 触发验证结果事件
      this.triggerEvent('validate', {
        valid: Object.keys(errors).length === 0,
        errors
      });

      return Object.keys(errors).length === 0;
    },

    // 验证单个属性
    validateAttribute(attribute, value) {
      // 必填验证
      if (attribute.required) {
        if (value === undefined || value === null || value === '') {
          return `${attribute.name}为必填项`;
        }
        if (Array.isArray(value) && value.length === 0) {
          return `${attribute.name}为必填项`;
        }
      }

      // 类型特定验证
      if (value !== undefined && value !== null && value !== '') {
        switch (attribute.type) {
          case 'number':
            if (isNaN(value)) {
              return `${attribute.name}必须是数字`;
            }
            if (attribute.validation) {
              if (attribute.validation.min !== null && value < attribute.validation.min) {
                return `${attribute.name}不能小于${attribute.validation.min}`;
              }
              if (attribute.validation.max !== null && value > attribute.validation.max) {
                return `${attribute.name}不能大于${attribute.validation.max}`;
              }
            }
            break;

          case 'text':
            if (attribute.validation) {
              if (attribute.validation.min !== null && value.length < attribute.validation.min) {
                return `${attribute.name}长度不能少于${attribute.validation.min}个字符`;
              }
              if (attribute.validation.max !== null && value.length > attribute.validation.max) {
                return `${attribute.name}长度不能超过${attribute.validation.max}个字符`;
              }
              if (attribute.validation.pattern && !new RegExp(attribute.validation.pattern).test(value)) {
                return `${attribute.name}格式不正确`;
              }
            }
            break;

          case 'select':
            if (attribute.options && !attribute.options.includes(value)) {
              return `${attribute.name}选项无效`;
            }
            break;

          case 'multiSelect':
            if (Array.isArray(value)) {
              const invalidOptions = value.filter(v => !attribute.options.includes(v));
              if (invalidOptions.length > 0) {
                return `${attribute.name}包含无效选项`;
              }
            }
            break;
        }
      }

      return null;
    },

    // 获取所有属性值
    getAllValues() {
      return this.data.attributeValues;
    },

    // 设置属性值
    setValues(values) {
      this.setData({
        attributeValues: { ...values }
      });
    },

    // 清空所有值
    clearValues() {
      const attributeValues = {};
      this.data.attributes.forEach(attr => {
        attributeValues[attr.id] = attr.defaultValue || this.getDefaultValueByType(attr.type);
      });

      this.setData({
        attributeValues,
        errors: {}
      });
    }
  },

  // 预定义颜色选项
  colorOptions: [
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
    '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#8B4513'
  ],

  // 预定义尺寸选项
  sizeOptions: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
});