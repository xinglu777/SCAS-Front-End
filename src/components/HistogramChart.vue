<template>
    <div class="dashboard">
        <div id="function-points-chart" style="width: 400px; height: 300px;"></div>
    </div>
</template>

<script lang="ts">
import * as echarts from 'echarts';
import { onMounted, watch, ref } from 'vue';
import service from '@/api';

export default {
    name: 'HistogramChartComponent',
    props: {
        theme: {
            type: String,
            required: true
        },
        id: {
            type: Number,
            required: true
        }
    },

    setup(props: any) {
        let functionPointsChart: echarts.ECharts | null = null;
        let functionPoints = ref<FunctionPoint[]>([])
        interface FunctionPoint {
            name: string;
            ufp: number;
        }
        onMounted(() => {
            window.addEventListener('resize', handleResize);
            getDashBoardDatas(props.id)
        });
        const handleResize = () => {
            functionPointsChart?.resize();
        };
        let mark = ref<string[]>([])
        let count = ref<number[]>([])
        async function getDashBoardDatas(id: any) {
            const data = await service.post('/functionProject/UFP', { id: id })
            if (data) {
                console.log('Data:', data);
                functionPoints.value = (data as unknown as { functionPoints: FunctionPoint[] }).functionPoints;
                clearData()
                functionPoints.value.forEach(element => {
                    mark.value.push(element.name)
                    count.value.push(element.ufp)
                });
                initProgressChart()
            }
        }
        function initProgressChart() {
            const chartDom = document.getElementById('function-points-chart')!;
            functionPointsChart = echarts.init(chartDom, props.theme);
            const option = {
                title: { text: '子系统功能点数' },
                tooltip: {
                    trigger: 'item', // 鼠标悬停在柱状图的某个元素上时触发 tooltip
                    formatter: (params: any) => {
                        // 自定义 tooltip 内容
                        return `${params.name}: ${params.value} UFP`;
                    }
                },
                xAxis: { type: 'category', data: mark.value },
                yAxis: { type: 'value', name: 'UFP' },
                series: [{ data: count.value, type: 'bar' }]
            };
            functionPointsChart.setOption(option);
        }
        function clearData(){
            mark.value=[]
            count.value=[]
        }
        watch(
            () => props.theme,
            () => {
                functionPointsChart?.dispose(); // 销毁旧图表实例
                getDashBoardDatas(props.id); // 使用新主题重新初始化图表
            }
        );
        return {
            initProgressChart,
            getDashBoardDatas
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