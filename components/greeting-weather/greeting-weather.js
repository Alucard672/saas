// 动态问候天气组件
Component({
  properties: {
    // 是否显示天气信息
    showWeather: {
      type: Boolean,
      value: true
    },
    // 默认城市
    defaultCity: {
      type: String,
      value: '北京'
    }
  },

  data: {
    greetingText: '早上好！',
    greetingIcon: '🌅',
    motivationText: '新的一天开始了',
    weatherData: {
      temperature: '--',
      description: '获取中...',
      icon: '🌤️',
      humidity: '--',
      windSpeed: '--',
      location: '定位中...'
    },
    weatherLoading: false,
    weatherError: ''
  },

  lifetimes: {
    attached() {
      this.updateGreeting();
      if (this.data.showWeather) {
        this.getWeatherData();
      }
      // 每分钟更新一次问候语
      this.greetingTimer = setInterval(() => {
        this.updateGreeting();
      }, 60000);
    },

    detached() {
      if (this.greetingTimer) {
        clearInterval(this.greetingTimer);
      }
    }
  },

  methods: {
    // 更新问候语
    updateGreeting() {
      const now = new Date();
      const hour = now.getHours();
      let greetingText, greetingIcon, motivationText;

      if (hour >= 5 && hour < 12) {
        greetingText = '早上好！';
        greetingIcon = '🌅';
        motivationText = '新的一天开始了';
      } else if (hour >= 12 && hour < 14) {
        greetingText = '中午好！';
        greetingIcon = '☀️';
        motivationText = '记得吃午饭哦';
      } else if (hour >= 14 && hour < 18) {
        greetingText = '下午好！';
        greetingIcon = '🌤️';
        motivationText = '继续加油工作';
      } else if (hour >= 18 && hour < 22) {
        greetingText = '晚上好！';
        greetingIcon = '🌆';
        motivationText = '辛苦了一天';
      } else {
        greetingText = '夜深了';
        greetingIcon = '🌙';
        motivationText = '早点休息吧';
      }

      this.setData({
        greetingText,
        greetingIcon,
        motivationText
      });
    },

    // 获取天气数据
    getWeatherData() {
      this.setData({
        weatherLoading: true,
        weatherError: ''
      });

      // 首先尝试获取用户位置
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.fetchWeatherByLocation(res.latitude, res.longitude);
        },
        fail: () => {
          // 获取位置失败，使用默认城市
          this.fetchWeatherByCity(this.data.defaultCity);
        }
      });
    },

    // 根据坐标获取天气
    fetchWeatherByLocation(lat, lon) {
      // 这里使用模拟数据，实际项目中需要调用真实的天气API
      // 例如：和风天气、心知天气等
      setTimeout(() => {
        const mockWeatherData = this.getMockWeatherData();
        this.setData({
          weatherData: {
            ...mockWeatherData,
            location: '当前位置'
          },
          weatherLoading: false
        });
      }, 1000);
    },

    // 根据城市获取天气
    fetchWeatherByCity(city) {
      // 模拟API调用
      setTimeout(() => {
        const mockWeatherData = this.getMockWeatherData();
        this.setData({
          weatherData: {
            ...mockWeatherData,
            location: city
          },
          weatherLoading: false
        });
      }, 1000);
    },

    // 获取模拟天气数据
    getMockWeatherData() {
      const weatherTypes = [
        { icon: '☀️', description: '晴朗', temp: 25 },
        { icon: '⛅', description: '多云', temp: 22 },
        { icon: '🌤️', description: '晴转多云', temp: 24 },
        { icon: '🌦️', description: '阵雨', temp: 20 },
        { icon: '🌧️', description: '小雨', temp: 18 },
        { icon: '❄️', description: '雪', temp: -2 }
      ];

      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      
      return {
        temperature: randomWeather.temp,
        description: randomWeather.description,
        icon: randomWeather.icon,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20km/h
      };
    },

    // 重试获取天气
    retryWeather() {
      this.getWeatherData();
    },

    // 真实天气API调用示例（需要申请API密钥）
    fetchRealWeatherData(lat, lon) {
      // 示例：使用和风天气API
      const apiKey = 'YOUR_API_KEY'; // 需要申请
      const url = `https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${apiKey}`;
      
      wx.request({
        url: url,
        method: 'GET',
        success: (res) => {
          if (res.data.code === '200') {
            const weather = res.data.now;
            this.setData({
              weatherData: {
                temperature: weather.temp,
                description: weather.text,
                icon: this.getWeatherIcon(weather.icon),
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                location: '当前位置'
              },
              weatherLoading: false
            });
          } else {
            this.handleWeatherError('获取天气信息失败');
          }
        },
        fail: () => {
          this.handleWeatherError('网络连接失败');
        }
      });
    },

    // 处理天气错误
    handleWeatherError(error) {
      this.setData({
        weatherError: error,
        weatherLoading: false
      });
    },

    // 根据天气代码获取对应图标
    getWeatherIcon(code) {
      const iconMap = {
        '100': '☀️', // 晴
        '101': '⛅', // 多云
        '102': '🌤️', // 少云
        '103': '☁️', // 晴间多云
        '104': '☁️', // 阴
        '300': '🌦️', // 阵雨
        '301': '🌧️', // 强阵雨
        '302': '⛈️', // 雷阵雨
        '303': '⛈️', // 强雷阵雨
        '304': '🌨️', // 雷阵雨伴有冰雹
        '305': '🌦️', // 小雨
        '306': '🌧️', // 中雨
        '307': '🌧️', // 大雨
        '308': '🌧️', // 极端降雨
        '309': '🌦️', // 毛毛雨/细雨
        '310': '🌧️', // 暴雨
        '311': '🌧️', // 大暴雨
        '312': '🌧️', // 特大暴雨
        '313': '🌨️', // 冻雨
        '400': '❄️', // 小雪
        '401': '❄️', // 中雪
        '402': '❄️', // 大雪
        '403': '❄️', // 暴雪
        '404': '🌨️', // 雨夹雪
        '405': '🌨️', // 雨雪天气
        '406': '🌨️', // 阵雨夹雪
        '407': '❄️', // 阵雪
        '500': '🌫️', // 薄雾
        '501': '🌫️', // 雾
        '502': '🌫️', // 霾
        '503': '💨', // 扬沙
        '504': '💨', // 浮尘
        '507': '💨', // 沙尘暴
        '508': '💨', // 强沙尘暴
        '900': '🌡️', // 热
        '901': '🧊', // 冷
        '999': '❓'  // 未知
      };
      
      return iconMap[code] || '🌤️';
    }
  }
});