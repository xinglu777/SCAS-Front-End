<template>
  <div :class="['timeline-container', themeClass]">
    <h2>项目进度时间轴</h2>
    <div class="timeline-wrapper">
      <!-- 时间轴节点 -->
      <div class="timeline">
        <div
            v-for="stage in stages"
            :key="stage.id"
            :class="['timeline-item', stage.completed ? 'completed' : '']"
        >
          <div class="timeline-circle"></div>
          <div class="timeline-content">
            <div class="timeline-title">{{ stage.title }}</div>
            <div class="timeline-date">{{ stage.date }}</div>
            <div class="timeline-description">{{ stage.description }}</div>
          </div>
        </div>
      </div>
      <!-- 时间轴主线 -->
      <div class="timeline-arrow-line"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, defineProps} from 'vue';
import service from "@/api";
import {Project} from "@/types/ProjectType";
import {ElMessage} from "element-plus";

// 定义项目阶段的数据类型
interface Stage {
  id: number;
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

// 使用 ref 创建响应式数据
const stages = ref<Stage[]>([{ "id": 1, "title": "项目创建", "date": "2024-10-01", "description": "完成项目的创建工作并上传相关的评估材料", "completed": true },
                                  { "id": 2, "title": "项目评估", "date": "2024-11-01", "description": "通过相关材料完成对项目功能点的评估工作", "completed": true },
                                  { "id": 3, "title": "评估审核", "date": "2024-12-01", "description": "生成相关评审报告审核人员完成对报告的审核", "completed": true },
                                  { "id": 4, "title": "项目完成", "date": "2025-01-01", "description": "项目审核工作完成后发布项目报表和数据看板", "completed": false },
]);

// 接收 `theme` 参数（浅色或深色模式）
const props = defineProps<{ theme: string ,id:number}>();

// 模拟后端数据获取函数，实际使用时可以通过 API 调用替换
async function fetchProjectStages() {
  console.log(props.id)
  const data = await service.post('/project/findTimeById', { id: props.id });
  if(data){
    const projectStartTime = (data as unknown as { projectStartTime: string }).projectStartTime;
    const projectEndTime = (data as unknown as { projectEndTime: string }).projectEndTime;
    stages.value[0].date=projectStartTime.slice(0,10)
    stages.value[3].date=projectEndTime.slice(0,10)
    console.log(projectStartTime)
  }
}

// 计算属性，根据 `theme` 返回对应的样式类
 const themeClass = computed(() => {
  return props.theme === 'dark' ? 'dark-mode' : 'light-mode';
});

// 在组件挂载时获取数据
onMounted(()=>{
  fetchProjectStages()
});
</script>

<style scoped>
/* 浅色模式样式 */
.light-mode {
  background-color: transparent;
}

/* 深色模式样式 */
.dark-mode {
  background-color: #100c2a;
  color: #fff;
}

.timeline-container {
  width: 90%;
  overflow-x: auto;
  padding: 20px;
  transition: background-color 0.3s ease;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.timeline-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding-bottom: 40px;
  overflow-x: auto;
}

.timeline {
  display: flex;
  gap: 40px;
  align-items: center;
  position: relative;
}

.timeline-arrow-line {
  position: absolute;
  top: 80%;
  left: 10px;
  right: 50px;
  height: 4px;
  background-color: #007bff;
  z-index: 0;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  z-index: 1;
}

.timeline-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #007bff;
  margin-bottom: 10px;
}

.timeline-item.completed .timeline-circle {
  background-color: #28a745;
}

.timeline-content {
  text-align: center;
}

.timeline-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.timeline-date {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.timeline-description {
  font-size: 14px;
}
</style>