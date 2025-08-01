Component({
  properties: {
    // 图标类型
    type: {
      type: String,
      value: 'info'
    },
    // 图标尺寸
    size: {
      type: String,
      value: 'medium' // small, medium, large, xlarge
    },
    // 线条粗细
    weight: {
      type: String,
      value: 'regular' // thin, regular, medium, bold
    },
    // 颜色主题
    color: {
      type: String,
      value: 'primary' // primary, secondary, success, warning, danger, muted
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      value: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 动画效果
    animation: {
      type: String,
      value: '' // spin, pulse
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: ''
    }
  },

  data: {
    
  },

  methods: {
    onTap(e) {
      if (!this.data.disabled && this.data.clickable) {
        this.triggerEvent('tap', {
          type: this.data.type
        });
      }
    }
  }
});