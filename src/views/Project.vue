<template>
  <div class="container">
    <!-- 标签切换 -->
    <div class="tabs-wrapper">
      <el-radio-group v-model="activeTab" class="custom-tabs" @change="handleTabChange">
        <el-radio-button label="details">详细信息</el-radio-button>
        <el-radio-button v-if="userType !== '1'" label="team">团队成员</el-radio-button>
      </el-radio-group>
    </div>
    <!-- 渲染子路由 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const userType = localStorage.getItem('userType');

// 当前激活的 Tab
const activeTab = ref(route.path.includes('/team') ? 'team' : 'details');

// Tab 切换时手动触发路由跳转
const handleTabChange = (newTab: string) => {
  // 获取当前的 projectName
  const projectName = route.params.projectName as string;
  // 跳转到对应的 tab 路由
  router.push(`/project/${newTab}/${projectName}`);
};

// 监听路由变化，动态更新选中状态
watch(
    () => route.path,
    (newPath) => {
      activeTab.value = newPath.includes('/team') ? 'team' : 'details';
    },
    { immediate: true }
);
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
}

.tabs-wrapper {
  margin-bottom: 20px; /* 确保 Tabs 和内容之间有一些间距 */
  position: absolute; /* 使用绝对定位 */
  top: 10px; /* 根据页面布局调整距离顶部的位置 */
  left: 20px; /* 将左侧偏移值调小，以使标签更靠左 */
}

.custom-tabs {
  border: none;
}

.el-radio-button__inner {
  border: none;
  border-radius: 0;
  padding: 10px 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  background-color: #f9f9f9;
}

.el-radio-button__inner:hover {
  background-color: #f2f6fc;
}

.el-radio-button__inner.is-active {
  background-color: #409eff;
  color: white;
  font-weight: bold;
}

.el-radio-button__inner:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.el-radio-button__inner:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
