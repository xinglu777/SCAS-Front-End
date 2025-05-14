<template>
    <div class="dashboard">
        <div id="function-points-area-chart" style="width: 400px; height: 300px;"></div>
    </div>
</template>

<script lang="ts">
import * as echarts from 'echarts';
import { onMounted, watch ,ref} from 'vue';
import service from '@/api';
export default {
    name: 'AreaChartComponent',
    props: {
        theme: {
            type: String,
            required: true
        },
        id:{
            type: Number,
            required: true
        }
    },
    setup(props: any) {
        let estimateReportChart: echarts.ECharts | null = null;
        onMounted(() => {
            window.addEventListener('resize', handleResize)
            getDashBoardDatas(props.id)
        })
        interface FunctionPoint{
            "subsystem": string,
            "complexities": string,
            "subFunctionName": string,
            "ilf":number,
            "eif": number,
            "eq": number,
            "ei": number,
            "eo": number,
            "ufp": number,
            "dfp": number
        }
        const handleResize = () => {
            estimateReportChart?.resize();
        };
        let mark=['EIF', 'ILF', 'EQ', 'EO', 'EI']
        let subsystems=ref<string[]>([])
        let EIFCount=ref<number[]>([])
        let ILFCount=ref<number[]>([])
        let EQCount=ref<number[]>([])
        let EoCount=ref<number[]>([])
        let EICount=ref<number[]>([])
        function initEstimateReportChart() {
            const chartDom = document.getElementById('function-points-area-chart')!;
            estimateReportChart = echarts.init(chartDom, props.theme);
            let option = {
                color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
                title: {
                    text: '子系统功能点分布图',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: subsystems.value,
                        axisLabel: {
                interval: 0, // 使得所有标签都显示
                rotate: 45,  // 如果标签过长，可以旋转标签
                formatter: (value:string) => {
                    return value.length > 10 ? value.substring(0, 10) + '...' : value; // 截短过长的标签
                }
            }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: mark[0],
                        type: 'line',
                        stack: 'Total',
                        smooth: true,
                        lineStyle: {
                            width: 0
                        },
                        showSymbol: false,
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(128, 255, 165)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(1, 191, 236)'
                                }
                            ])
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: EIFCount.value
                    },
                    {
                        name: mark[1],
                        type: 'line',
                        stack: 'Total',
                        smooth: true,
                        lineStyle: {
                            width: 0
                        },
                        showSymbol: false,
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(0, 221, 255)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(77, 119, 255)'
                                }
                            ])
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: ILFCount.value
                    },
                    {
                        name: mark[2],
                        type: 'line',
                        stack: 'Total',
                        smooth: true,
                        lineStyle: {
                            width: 0
                        },
                        showSymbol: false,
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(55, 162, 255)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(116, 21, 219)'
                                }
                            ])
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: EQCount.value
                    },
                    {
                        name: mark[3],
                        type: 'line',
                        stack: 'Total',
                        smooth: true,
                        lineStyle: {
                            width: 0
                        },
                        showSymbol: false,
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(255, 0, 135)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(135, 0, 157)'
                                }
                            ])
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: EoCount.value
                    },
                    {
                        name: mark[4],
                        type: 'line',
                        stack: 'Total',
                        smooth: true,
                        lineStyle: {
                            width: 0
                        },
                        showSymbol: false,
                        label: {
                            show: true,
                            position: 'top'
                        },
                        areaStyle: {
                            opacity: 0.8,
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: 'rgb(255, 191, 0)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgb(224, 62, 76)'
                                }
                            ])
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: EICount.value
                    }
                ]
            };

            estimateReportChart.setOption(option);
        }

        watch(
            () => props.theme,
            () => {
                estimateReportChart?.dispose(); // 销毁旧图表实例
                getDashBoardDatas(props.id); // 使用新主题重新初始化图表
            }
        );
        async function getDashBoardDatas(id:any) {
            const data = await service.post('/dashboard/getFunctionNum', { id: id })
            if (data) {
               const functionPoints = (data as unknown as { functionPoints: FunctionPoint[] }).functionPoints;
               clearData()
               functionPoints.forEach(element => {
                   subsystems.value.push(element.subsystem)
                   EIFCount.value.push(element.eif)
                   ILFCount.value.push(element.ilf)
                   EQCount.value.push(element.eq)
                   EICount.value.push(element.ei)
                   EoCount.value.push(element.eo)
                });
                initEstimateReportChart()
            }
    }
    function clearData(){
        subsystems.value=[]
        EICount.value=[]
        EIFCount.value=[]
        ILFCount.value=[]
        EQCount.value=[]
        EoCount.value=[]
    }
        return {
            initEstimateReportChart,
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