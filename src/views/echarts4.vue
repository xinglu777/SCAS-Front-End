<template>
  <div style="width: auto; height: 185px" id="echarts4"></div>
</template>

<script>
//import echarts from "echarts";
import * as echarts from 'echarts';
export default {
  name: "echarts4",
  props: {
    gscData: {
      type: Object,
      required: true, // 接收父组件传递的 GSC 数据
    },
    gscLabels: {
      type: Object,
      required: true, // 接收父组件传递的 GSC 标签
    },
  },
  watch: {
    gscData: {
      deep: true, // 深度监听 GSC 数据变化
      handler() {
        console.log("接收到的 GSC 数据:", this.gscData);
        this.updateChart(); // 数据变化时更新图表
      },
    },
  },
  data() {
    return {
      chart: null,
      option: {
        legend: {
          data: ["GSC 权值"], // 图例
          orient: "horizontal", // 设置图例水平排列
          bottom: 0, // 图例位置（可以调整到图表底部）
          left: "center", // 居中对齐
          itemGap: 10, // 图例项之间的间距
          textStyle: {
            fontSize: 12, // 图例文字大小
          },
        },
        radar: {
          indicator: [], // 指标将根据 gscLabels 动态生成
        },
        series: [
          {
            name: "GSC 权值",
            type: "radar",
            data: [], // 雷达图数据
          },
        ],
      },
    };
  },
  mounted() {
    this.echartsInit(); // 初始化图表
  },
  methods: {
    echartsInit() {
      this.chart = echarts.init(document.getElementById("echarts4"));
      this.updateChart(); // 初始化时绘制图表
    },
    updateChart() {
      if (!this.chart) {
        this.echartsInit(); // 如果图表未初始化，先初始化
      }

      // 构建雷达图的指标 (indicator)
      this.option.radar.indicator = Object.keys(this.gscLabels).map((key) => ({
        name: this.gscLabels[key], // 标签名
        max: 5, // 假定最大值为 5，根据需求调整
      }));

      // 构建雷达图的数据
      const value = Object.keys(this.gscData).map((key) => Number(this.gscData[key]) || 0);

      this.option.series[0].data = [
        {
          value: value, // GSC 数据值
          name: "GSC 权值",
        },
      ];

      // 更新图表
      console.log("更新后的雷达图数据：", this.option.series[0].data);
      this.chart.setOption(this.option);
    },
  },
};
</script>

<style scoped></style>
