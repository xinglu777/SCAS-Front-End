<template>
  <div class="dashboard">
    <div id="approval-chart" style="width: 400px; height: 300px;"></div>
  </div>
</template>

<script lang="ts">
import * as echarts from 'echarts';
import {onMounted, ref, watch} from 'vue';

interface pieChart{
  value : number,
  name : string
}
export default {
  name: 'PieChartComponent',
  props: {
    theme: {
      type: String,
      required: true
    } ,
        id:{
            type: Number,
            required: true
        }
  },
  setup(props: any) {
    let ApprovalChart: echarts.ECharts | null = null;
    onMounted(() => {
      InitApprovalPieChart();
      window.addEventListener('resize', handleResize);
      getDashBoardDatas(props.id)
    });
    const handleResize = () => {
      ApprovalChart?.resize();
    };
    function InitApprovalPieChart() {
      const chartDom = document.getElementById('approval-chart')!;
      ApprovalChart = echarts.init(chartDom, props.theme);
      const rowContributionData= ref<pieChart[][]>([[
        { value: 65, name: '罗金璐' },
        { value: 59, name: '何博艺' },
        { value: 50, name: '关洁' },
        { value: 30, name: '笪亦佳' },
        { value: 35, name: '谷金杰' },
      ],[
        { value: 75, name: '韩雨' },
        { value: 66, name: '徐鹤原' },
        { value: 32, name: '陈祉夷' },
        { value: 40, name: '李四' },
      ],[
        { value: 67, name: '张三' },
        { value: 78, name: '王五' },
        { value: 52, name: '小六' },
        { value: 40, name: '李四' },
      ]])
      let contributionData = rowContributionData.value[props.id%2]
      const option = {
        
        title: {
              text: '任务分配图'
            },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [20, 100],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 4
            },
            data:contributionData
          }
        ]
      };

      ApprovalChart.setOption(option);
    }
    async function getDashBoardDatas(id:any) {
      console.log(id)
    }
    watch(
      () => props.theme,
      () => {
        ApprovalChart?.dispose(); // 销毁旧图表实例
        InitApprovalPieChart(); 
        // 使用新主题重新初始化图表
      }
    );
    return {
      getDashBoardDatas,
      InitApprovalPieChart
    };
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}
</style>