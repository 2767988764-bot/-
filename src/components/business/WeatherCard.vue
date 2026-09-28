<template>
  <div class="weather-card">
    <div class="weather-header">
      <h3 class="weather-title">天气预报</h3>
      <span class="weather-update">更新于 {{ updateLabel }}</span>
    </div>
    <div class="weather-body">
      <div class="weather-main">
        <i class="weather-icon" :class="iconClass"></i>
        <div class="weather-temp">{{ weather.temperature }}<span class="weather-unit">℃</span></div>
        <div class="weather-desc">{{ weather.weather }}</div>
      </div>
      <div class="weather-meta">
        <div class="meta-row">
          <i class="el-icon-location-outline"></i>
          <span class="meta-label">城市</span>
          <span class="meta-value">{{ weather.city }}</span>
        </div>
        <div class="meta-row">
          <i class="el-icon-date"></i>
          <span class="meta-label">日期</span>
          <span class="meta-value">{{ weather.date }}</span>
        </div>
        <div class="meta-row">
          <i class="el-icon-c-scale-cs"></i>
          <span class="meta-label">湿度</span>
          <span class="meta-value">{{ weather.humidity }}</span>
        </div>
        <div class="meta-row">
          <i class="el-icon-wind-power"></i>
          <span class="meta-label">风力</span>
          <span class="meta-value">{{ weather.wind }}</span>
        </div>
      </div>
    </div>
    <div class="weather-advice">
      <i class="el-icon-magic-stick"></i>
      <span>{{ weather.advice }}</span>
    </div>
  </div>
</template>

<script>
/**
 * WeatherCard 天气预报卡片
 * 用于首页仪表盘顶部，展示当日仓储所在地的天气与作业建议
 * 天气图标使用 Element-UI 内置 weather 类图标
 */
const WEATHER_ICON_MAP = {
  晴: 'el-icon-sunny',
  多云: 'el-icon-cloudy',
  阴: 'el-icon-partly-cloudy',
  小雨: 'el-icon-light-rain',
  中雨: 'el-icon-showers',
  大雨: 'el-icon-heavy-rain',
  雷阵雨: 'el-icon-lightning',
  雪: 'el-icon-snow'
}

export default {
  name: 'WeatherCard',
  props: {
    /** 天气数据：{ city, date, temperature, weather, humidity, wind, advice } */
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      // 默认展示数据：杭州仓前路仓所在地
      // 业务逻辑待后端对接时完善：接入真实天气服务 API
      defaultWeather: {
        city: '杭州',
        date: '2026-09-28',
        temperature: 23,
        weather: '多云',
        humidity: '62%',
        wind: '东南风 3 级',
        advice: '天气适宜，建议安排户外搬运与盘点作业，注意防潮防湿。'
      }
    }
  },
  computed: {
    weather() {
      return { ...this.defaultWeather, ...this.data }
    },
    iconClass() {
      return WEATHER_ICON_MAP[this.weather.weather] || 'el-icon-cloudy'
    },
    updateLabel() {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      return `${h}:${m}`
    }
  }
}
</script>

<style lang="scss" scoped>
.weather-card {
  @include wms-card;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .weather-title {
    font-family: $wms-font-heading;
    font-size: $wms-fs-lg;
    font-weight: 600;
    color: $wms-text;
    line-height: 1.3;
  }

  .weather-update {
    font-size: $wms-fs-sm;
    color: $wms-text-3;
  }
}

.weather-body {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.weather-main {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  background: $wms-brand-soft;
  border-radius: $wms-radius-md;

  .weather-icon {
    font-size: 36px;
    color: $wms-brand;
    line-height: 1;
  }

  .weather-temp {
    font-family: $wms-font-heading;
    font-size: $wms-fs-3xl;
    font-weight: 600;
    color: $wms-text;
    line-height: 1;

    .weather-unit {
      font-size: $wms-fs-md;
      margin-left: 2px;
      color: $wms-text-2;
    }
  }

  .weather-desc {
    font-size: $wms-fs-base;
    color: $wms-text-2;
  }
}

.weather-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;

  .meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $wms-fs-base;
    color: $wms-text-2;

    i {
      color: $wms-brand;
      font-size: 14px;
    }

    .meta-label {
      flex: 0 0 36px;
      color: $wms-text-3;
    }

    .meta-value {
      color: $wms-text;
      font-weight: 500;
    }
  }
}

.weather-advice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: $wms-panel-3;
  border-radius: $wms-radius;
  font-size: $wms-fs-sm;
  color: $wms-text-2;
  line-height: 1.6;

  i {
    color: $wms-warn;
    flex-shrink: 0;
    margin-top: 2px;
  }
}
</style>
