<template>
  <div style="width: auto; height: 185px" id="echarts3"></div>
</template>

<script>
//import echarts from "echarts";
import * as echarts from 'echarts';
export default {
  name: "echarts3",
  props: {
    savedSubFunctionResults: {
      type: Array,
      required: true, // 接收父组件传递的子功能数据
    },
  },
  watch: {
    savedSubFunctionResults: {
      deep: true, // 深度监听数组变化
      handler() {
        console.log("接收到的 savedSubFunctionResults 数据:", this.savedSubFunctionResults);
        this.updateChart(); // 数据变化时更新图表
      },
    },
  },
  data() {
    return {
      chart: null,
      option: {
        legend: {
          data: [], // 图例数据
          orient: "horizontal", // 设置图例水平排列
          bottom: 10, // 图例位置（可以调整到图表底部）
          left: "center", // 居中对齐
          itemGap: 10, // 图例项之间的间距
          textStyle: {
            fontSize: 12, // 图例文字大小
          },
        },

        radar: {
          indicator: [
            { name: "ILF", max: 5 },
            { name: "EIF", max: 5 },
            { name: "EI", max: 5 },
            { name: "EO", max: 5 },
            { name: "EQ", max: 5 },
          ],
        },
        series: [
          {
            name: "子功能分析雷达图",
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
      this.chart = echarts.init(document.getElementById("echarts3"));
      this.chart.setOption(this.option);
    },
    updateChart() {
      if (!this.chart) {
        this.echartsInit(); // 如果图表未初始化，先初始化
      }

      // 获取所有类型的全局最大值
      const globalMax = Math.max(
          ...this.savedSubFunctionResults.flatMap(item => [
            Number(item.ilf) || 0, // ILF
            Number(item.eif) || 0, // EIF
            Number(item.ei) || 0,  // EI
            Number(item.eo) || 0,  // EO
            Number(item.eq) || 0,  // EQ
          ])
      );

      // 动态更新 radar.indicator 的最大值（所有指标使用相同的最大值）
      this.option.radar.indicator = [
        { name: "ILF", max: globalMax },
        { name: "EIF", max: globalMax },
        { name: "EI", max: globalMax },
        { name: "EO", max: globalMax },
        { name: "EQ", max: globalMax },
      ];

      // 更新图例和数据
      this.option.legend.data = this.savedSubFunctionResults.map(item => item.subFunctionName);

      this.option.series[0].data = this.savedSubFunctionResults.map(item => {
        const value = [
          Number(item.ilf) || 0, // ILF
          Number(item.eif) || 0, // EIF
          Number(item.ei) || 0,  // EI
          Number(item.eo) || 0,  // EO
          Number(item.eq) || 0,  // EQ
        ];
        return {
          value: value,
          name: item.subFunctionName,
        };
      });

      // 清除缓存并更新图表
      this.chart.clear();
      this.chart.setOption(this.option, true);
    },
  },
};
</script>

<style scoped></style>

