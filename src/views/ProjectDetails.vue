<template>
  <div class="project-details-container">
    <h2>{{ projectData.projectName }}</h2>
    <p>项目截止时间：{{ projectData.deadline }}</p>

    <!-- 项目简介部分，增加滚动功能 -->
    <div class="project-description-container">
      <h3>项目简介：</h3>
      <div class="project-description">
        <span class="ql-editor" v-html="projectData.description"></span>
      </div>
    </div>


    <div class="project-progress">
      <h3>项目进度：</h3>
      <div class="steps-container">
        <el-steps :active="activeStep" align-center finish-status="success">
          <el-step title="评估准备" description="评估前的文件准备和评估" />
          <el-step title="审核报表" description="审核员审核相关报表" />
          <el-step title="完成项目评估" description="项目评估全部过程已完成" />
        </el-steps>
      </div>
    </div>

    <div class="team-info-horizontal">
      <div class="team-member assessors">
        <el-icon :size="24">
          <UserFilled />
        </el-icon>
        当前评估师：{{ projectData.assessorsCount }} 人
      </div>
      <div class="team-member reviewers">
        <el-icon :size="24">
          <UserFilled />
        </el-icon>
        当前审核员：{{ projectData.reviewersCount }} 人
      </div>
    </div>

    <div class="action-buttons">
      <el-button type="primary" plain icon="Document" @click="downloadRequirementReport" :class="buttonClass">
        点击下载项目需求说明书
      </el-button>
      <el-button type="primary" plain icon="Download" @click="downloadEvaluationReport" :class="buttonClass">
        点击下载项目造价评估报告
      </el-button>
      <el-button
          v-if="actor !== 3"
          type="warning"
          plain
          @click="pinggu"
          :disabled="projectData.state === '评估完成' || projectData.state === '待审核' || projectData.state === '审核通过' || actor === 1"
      >
        评估项目
      </el-button>
      <el-button
          v-if="actor !== 3"
          type="danger"
          plain
          @click="shenhe"
          :disabled="projectData.state === '评估完成' || projectData.state === '审核通过' || actor === 0"
      >
        审核项目
      </el-button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, UnwrapRef } from 'vue';
import { useRoute } from 'vue-router';
import {downloadRequirement, searchForActor, searchProjects} from '@/api/apiList/project';
import { ElMessage } from 'element-plus';
import { getTeamCounts } from "@/api/apiList/project";
import { UserFilled } from '@element-plus/icons-vue';
import axios from "axios";
axios.defaults.withCredentials = true;

// 定义响应式变量，用于存储项目信息
const activeStep = ref(0); // 项目进度的步骤

// 获取当前路由，获取传递的 projectName
const userInfoString = localStorage.getItem("userInfo");
const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
const route = useRoute();
const projectName = route.params.projectName as string;
let pId = null; // 获取当前项目 ID
let actor = 0; //acotr

const projectData = ref({
  assessorsCount: 0,
  reviewersCount: 0,
  projectId: 0,
  projectName: "", // 项目名称
  tenantId: userInfo.tenantId || 0, // 从 userInfo 动态获取 tenantId，默认为 0
  imageUrl: "", // 项目封面图片
  description: "", // 项目描述
  requirement: "", // 项目需求文档
  creator: userInfo.tenantName || "未知租户", // 从 userInfo 动态获取 tenantName
  startTime: new Date().toISOString(), // 当前时间
  deadline: "", // 项目截止日期
  state: "", // 默认状态
  // 其他项目数据...
});

// 获取按钮的样式类
const buttonClass = ref('default-button');


// 根据项目状态决定显示的步骤
const pinggu = () => {
  ElMessage.success('进行评估项目');
};


// 根据项目状态决定显示的步骤
const shenhe = () => {
  ElMessage.success('进行审核项目');
};

const fetchProjectData = async () => {
  try {
    console.log("projectName获取时候的传参为：", projectName);
    const response = await searchProjects({ projectName });
    if (response && response.code === 1000 && response.data.length > 0) {
      console.log("后端传回来的项目详细信息：", response);
      projectData.value = response.data[0]; // 假设返回多个项目，我们只需要第一个
      pId = projectData.value.projectId;
      if(localStorage.getItem('userType') == 0){
        actor = 3
      }else{
        let info : any= await searchForActor(JSON.parse(localStorage.getItem('userInfo')).userId,pId);
        if (info && info.code === 1000) {
          actor = info.data
          console.log("actor",actor)
        } else {
          console.error("出现错误:", response.message);
        }
      }
      determineActiveStep(); // 获取数据后更新步骤
      fetchTeamCounts(pId);

    } else {
      ElMessage.error('未找到对应的项目数据');
    }
  } catch (error) {
    console.error('获取项目信息出错:', error);
    ElMessage.error('获取项目信息失败');
  }
};

// 在组件内使用，假设 projectId 是你当前项目的 ID
const fetchTeamCounts = async (projectId: UnwrapRef<null>) => {
  console.log("传回去的projectId:", projectId);
  try {
    const response = await getTeamCounts(projectId);
    if (response && response.code === 1000) {
      const { assessorsCount, reviewersCount } = response.data;
      // 更新前端数据
      projectData.value.assessorsCount = assessorsCount;
      projectData.value.reviewersCount = reviewersCount;
    } else {
      console.error("获取团队成员数量失败:", response.message);
    }
  } catch (error) {
    console.error("获取团队成员数量时出错:", error);
  }
};



// 根据项目状态决定显示的步骤
const determineActiveStep = () => {
  switch (projectData.value.state) {
    case '待评估':
      activeStep.value = 1; // 评估准备
      break;
    case '审核通过':
    case '待审核':
    case '审核未通过':
      activeStep.value = 2; // 审核报表
      break;
    case '评估完成':
      activeStep.value = 3; // 完成项目评估
      break;
    default:
      activeStep.value = 0; // 默认设置为评估准备
  }
};

// 下载报告功能
const downloadEvaluationReport = () => {
  ElMessage.success('下载评估报告的功能待实现');
};

const downloadRequirementReport = () => {
  if (projectData.value.requirement) {
    //window.open(projectData.value.requirement, '_blank');
    downloadRequirement(projectData.value.projectId)
        .then(response => {
          if (response && response.data){
            console.log(response.data)
            //window.open(response.data, '_blank');

            const a = document.createElement('a');
            a.href = response.data;
            a.download = '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            //return response.data.blob();
          }else{
            throw new Error("文件下载失败！！");
          }
        })
    // .then(blob => {
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = projectData.value.requirement;
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   window.URL.revokeObjectURL(url);
    // })
    // .catch(error => {
    //   console.error("下载失败");
    // })
  } else {
    ElMessage.error('未找到项目需求说明书的下载链接');
  }
};


// 页面加载时获取数据
onMounted(() => {
  fetchProjectData();
});
</script>

<style scoped>
.project-details-container {
  padding: 20px;
  text-align: left; /* 左对齐 */
}
.project-description-container {
  height: 400px;
  margin-bottom: 15px;
}

.project-description {
  margin-top: 10px;
  height: 300px;
}

/* 渐变分隔符样式 */
.gradient-divider {
  height: 5px;
  background: linear-gradient(to right, #ff9a9e, #fad0c4);
  border-radius: 3px;
  margin: 20px 0;
}

.full-width-steps {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.project-description-container {
  margin-bottom: 15px;
  width: 1480px; /* 控制宽度，防止内容撑开布局 */
  max-height: 200px; /* 设置最大高度，超出部分可滚动 */



  border-radius: 5px;

}

.project-description {
  margin-top: 2px;
  word-break: break-word;
  height: 300px; /* 设置最大高度，超出部分可滚动 */
  overflow: auto; /* 超出部分显示滚动条 */

}


.project-description img {
  max-width: 100%; /* 图片宽度限制在容器范围内 */
  height: auto;
  display: block;
  margin: 0 auto; /* 图片居中 */
}

.project-progress {
  //width: 100%;
  margin-top: 150px;
  width: 1500px;
  margin-bottom: 20px;
  text-align: left; /* 左对齐 */
}

.team-info-horizontal {
  display: flex;
  gap: 30px; /* 横向间距 */
  margin-bottom: 10px;
  margin-top: 48px;

}


.team-member {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.team-member.assessors {
  color: #dc8621; /* 评估师颜色 */
}

.team-member.reviewers {
  color: #a36717; /* 审核员颜色 */
}

.team-member .el-icon {
  margin-right: 10px;
}

.action-buttons {

  position: fixed;
  margin-left: 80px;
  bottom: 20px;
  left: 180px;

}
.el-button {
  margin-right: 10px;
}


.el-button:disabled {
  background-color: #e0e0e0; /* 禁用时为灰色 */
  border: 1px solid #d3d3d3;
  color: #b0b0b0;
}



.default-button:disabled {
  background-color: #e0e0e0; /* 禁用时为灰色 */
  color: #b0b0b0;
}

</style>
