<template>
  <div>
    <el-row class="border_shadow" :style="{ backgroundColor: bgColor }">
      <el-col :span="1"><el-button :icon="Close" circle @click="router.back()" /></el-col>
      <el-col :span="6">
          <area-chart-component v-if="isAreaChartComponentVisual"  :theme="theme" :id="projectId"/>
          <histogram-chart-component v-if="isHistogramChartComponentVisual"  :theme="theme" :id="projectId"/>
          </el-col>
        <el-col :span="12">
          <el-row>
            <pie-chart-component v-if="isPieChartComponentVisual" :theme="theme" :id="projectId"/>
          </el-row>
          <el-row><ProjectTimeline  v-if="isProjectTimelineVisual" :theme="theme"  :id="projectId"/></el-row>
        </el-col>
      <div class="divider"></div>
      <el-col :span="4">
        <el-row style="align-items:center;">
          <el-icon>
            <Tools />
          </el-icon>
          <span style="margin-left: 10px;font-size: small;">看板设置</span>
        </el-row>
        <el-card style="max-width: 500px;margin-top: 30px;align-items:center;margin-left: 10px;">
          <el-row style="align-items:center;">
            <span style="margin-right: 10px;font-size: small;">主题模式</span>
            <el-radio-group v-model="theme">
              <el-radio value="light">浅色</el-radio>
              <el-radio value="dark">深色</el-radio>
            </el-radio-group>
          </el-row>
          <el-divider />
          <el-row style="align-items:center;">
            <el-col :span="14"><span style="font-size: small;">子系统功能点分布图</span></el-col>
            <el-col :span="10"><el-switch v-model="isAreaChartComponentVisual" style="margin-left: 10px;" /></el-col>
          </el-row>
          <el-row style="align-items:center;">
            <el-col :span="14" style="font-size: small;"><span>调整后功能点图</span></el-col>
            <el-col :span="10"> <el-switch v-model="isHistogramChartComponentVisual"
                style="margin-left: 10px;" /></el-col>
          </el-row>
          <el-row style="align-items:center;">
            <el-col :span="14" style="font-size: small;"> <span>任务分配图</span></el-col>
            <el-col :span="10"><el-switch v-model="isPieChartComponentVisual" style="margin-left: 10px;" /></el-col>
          </el-row> 
          <el-row style="align-items:center;">
            <el-col :span="14" style="font-size: small;"> <span>项目进度时间轴</span></el-col>
            <el-col :span="10"><el-switch v-model="isProjectTimelineVisual" style="margin-left: 10px;" /></el-col>
          </el-row>
          <el-divider />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted ,watch} from 'vue';
import { Close } from '@element-plus/icons-vue'
import AreaChartComponent from '@/components/AreaChart.vue';
import HistogramChartComponent from '@/components/HistogramChart.vue'
import PieChartComponent from '@/components/PieChart.vue'
import ProjectTimeline from '@/components/TimeLine.vue'
import { useRoute, useRouter } from 'vue-router';
export default defineComponent({
  name: 'ProjectGenerationComponent',
  components: {
    AreaChartComponent,
    HistogramChartComponent,
    PieChartComponent,
    ProjectTimeline
  },
  setup() {
    const theme = ref('light')
    const route = useRoute()
    const router = useRouter()
    const  projectId  = Number(route.query.projectId) || 0
    let isAreaChartComponentVisual = ref(false);
    let isHistogramChartComponentVisual = ref(false);
    let isPieChartComponentVisual = ref(false);
    let isProjectTimelineVisual=ref(false)
    let bgColor=ref('#efe8e8')
    watch(
      () => theme.value,
      () => {
        if(theme.value=='light')bgColor.value='#efe8e8'
        else bgColor.value='#100c2a'
      }
    );
    console.log('项目id', projectId)
    return {
      projectId,
      Close,
      theme,
      bgColor,
      isAreaChartComponentVisual,
      isHistogramChartComponentVisual,
      isPieChartComponentVisual,
      isProjectTimelineVisual,
      router
    };
  }
});
</script>
<style scoped>
h1 {
  font-size: 36px;
  text-align: center;
  margin-top: 20px;
}

.divider {
  width: 1px;
  background-color: #e0e0e0;
  margin: 0 10px;
  /* 两边间距 */
  height: auto;
  /* 默认撑满列的高度 */
}

.border_shadow {
  width: 100%;

  box-shadow: 10px 10px 10px #e1e3e700;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  padding: 10px;
}
</style>