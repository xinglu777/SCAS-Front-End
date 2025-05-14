<template>
  <el-row style="margin-top: 10px;margin-bottom: 10px;" class="operation_shadow">
    <el-col :span="4">
  </el-col>
  <el-col :span="6">
    <el-row>
      <el-text size="medium" style="margin-right: 10px;">查询方式</el-text>
      <el-select-v2
          v-model="queryType"
          placeholder="请选择查询方式"
          :options="options"
          size="medium"
          :style="{ width: smallScreen ? '160px' : '200px' ,}"
      />
    </el-row>
  </el-col>
  <el-col :span="6">
    <el-text size="medium">查询参数</el-text>
    <el-input v-model="searchProp" style="width: 160px;margin-left: 10px;" placeholder="请输入搜索关键词" size="medium" />
  </el-col>
  <el-col :span="4">
    <el-row>
      <div>
        <el-button size="medium" type="primary" @click="searchProject()" :icon="Search">搜索</el-button>
        <el-button size="medium" :icon="RefreshLeft" @click="reset()">重置</el-button>
      </div>
    </el-row>
  </el-col>
</el-row>

  <el-table :data="pagedProjects" style="width: 100%">
    <el-table-column prop="id" label="项目编号" align="center" />
    <el-table-column prop="projectName" label="项目名称" align="center" />
    <el-table-column prop="state" label="项目状态" align="center" />
    <el-table-column prop="startTime" label="开始时间" align="center" />
    <el-table-column prop="endTime" label="结束时间" align="center" />
    <el-table-column fixed="right" label="操作" min-width="60" align="center">
      <template #default="scope">
        <el-tooltip content="查看报告" effect="light" placement="top">
          <el-button type="primary" :icon="Search" @click="downloadFile(scope.row);"
                     style="margin-right: 10px;" circle/>
        </el-tooltip>
        <el-tooltip content="报告评审" effect="light" placement="top">
          <el-button type="danger" :icon="Document" circle style="margin-right: 10px;"
                     @click="handlePreview(scope.row); drawer = true"/></el-tooltip>
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block">
    <el-col :span="18">
      <el-pagination @current-change="handleCurrentChange" :current-page="currentPage1" :page-size="pageSize"
                     layout="total, prev, pager, next" :total="totalItems">
      </el-pagination>
    </el-col>
  <el-drawer v-model="drawer"  title="项目评审" :direction="direction" :before-close="handleClose" :size="500">
    <span>请选项报告是否通过审批</span>
    <div style="margin-top: 40px;"></div> <!-- 增加行距 -->
    <el-col>
      <el-button size="medium" type="primary" @click="checkOk()" :icon="Search">审批通过</el-button>
      <el-button size="medium"  @click="checkNo()">审批不通过</el-button>
    </el-col>
    <div style="margin-top: 40px;"></div>
    <el-upload
        class="vedio-uploader"
        :limit="1"
        :on-success="handleFileSuccess"
        :before-upload="beforeFileUpload"
        :show-file-list="true"
        :http-request="uploadFile"
    >
     <el-button size="medium" type="primary" :icon="RefreshLeft">点击上传</el-button>
     <br>
     <div class="el-upload__tip">只能上传doc\docx 文件，且不超过10MB</div>
     </el-upload>
  </el-drawer>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref, onMounted, computed} from 'vue';
import { useRouter } from 'vue-router';
import { Project } from '@/types/ProjectType'
import {Search, RefreshLeft, Document, Files, FolderOpened} from '@element-plus/icons-vue'
import {
  ComponentSize,
  DrawerProps,

  ElMessage,
  ElMessageBox,

} from 'element-plus'
import type {UploadFile } from 'element-plus'
import service from '@/api';
import {ElLoading} from 'element-plus'

export default defineComponent({
  name: 'ProjectDashBoardListComponent',
  computed: {
    FolderOpened() {
      return FolderOpened
    }
  },
  setup() {
    let ProjectTableData = ref<Project[]>([])
    let searchProjectData = ref<Project>()
    const currentPage1 = ref(5)
    const size = ref<ComponentSize>('default')
    const background = ref(false)
    const disabled = ref(false)
    const router = useRouter();
    const direction = ref<DrawerProps['direction']>('rtl')
    const drawer = ref(false)
    const queryType=ref()
    const smallScreen = ref(window.innerWidth < 768)
    let searchProp = ref()
    const totalItems=ref(0)
    const pageSize = ref(5)
    const currentPage = ref(1)
    const fileUrl = ref()
    const drawerVisible = ref(false)
    const rowId = ref<number>(0)
    const options=ref([{
      label:'项目编号',
      value:'id'
    },{
      label:'项目名称',
      value:'name'
    }])
    let rawFile=ref()
    onMounted(() => {
      getProjects()
    })
    const pagedProjects = computed(() => {
      return ProjectTableData.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize
          .value);
    })

    const handleSizeChange = (val: number) => {
      console.log(`${val} items per page`)
    }
    const handleCurrentChange = (val:number) => {
      currentPage.value = val;
    }
    const changeFile = (uploadFile: UploadFile) => {
      rawFile.value = uploadFile;
      //rawFile.value = uploadFile.raw;
      console.log("rawFile.value.raw=====>")
      console.log(rawFile.value.raw)
    }

    const handleFileSuccess = (response:any, uploadFile:any) => {
      const url = (response as unknown as { url: string }).url;
      console.log('url:', url);
      if (url) {
        fileUrl.value = url; // 设置上传成功的图片URL
        console.log('fileUrl:', fileUrl);
      } else {
        // 如果url不存在，你可以添加一个错误处理逻辑
        console.error('Error:response.data.url is undefined');
      }
    }
    const beforeFileUpload = (rawFile:any) =>{
      // 检查文件类型，允许的文件类型包括'image/jpeg'，'image/png'，'image/ipg
      console.log(rawFile.type)
      if (!['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(rawFile.type)) {
        ElMessage.error('文件格式需为doc/docx格式!');
        return false;
      } // 检查文件大小，不超过10MB
      else if (rawFile.size / 1024 / 1024 > 10) {
        ElMessage.error('视频大小不能超过10MB!');
        return false;
      }
      return true;
    }
    const uploadFile = async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await service.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response)
        onSuccess(response);
      } catch (error) {
        console.error("Upload error:", error);
        onError(error);
      }
    };
    function downloadFile(row: any) {
      const link = document.createElement("a");
      link.href = "http://localhost:9000/report/downloadfile?id="+row.id; // 设置文件下载链接
      link.download = ""; // 可选，设置下载后的文件名
      document.body.appendChild(link); // 将链接添加到 DOM 中
      link.click(); // 触发点击事件
      document.body.removeChild(link); // 删除链接
    }
    async function searchProject() {
      console.log("搜索===》")
      console.log(queryType.value)
      console.log(searchProp.value)
      if (queryType.value != null) {
        if(searchProp.value!=null){
          if (queryType.value == 'id') {
          const data = await service.post('/project/findToBeReviewedByCondition', { id: searchProp.value });
          if(data){
          const projects = (data as unknown as { projects: Project[] }).projects;
          ProjectTableData.value = projects}
          else {
            ProjectTableData.value=[];
          }
          totalItems.value=ProjectTableData.value.length
        }else if(queryType.value=='name'){
          const data = await service.post('/project/findToBeReviewedByCondition',{projectName:searchProp.value});
          if(data){
          const projects = (data as unknown as { projects: Project[] }).projects;
          ProjectTableData.value = projects
         }else {
            ProjectTableData.value=[];
          }
          totalItems.value=ProjectTableData.value.length
        }
        }else{
          ElMessage.warning('请输入查询关键词')
        }
        
      } else {
        ElMessage.warning('请选择查询方式')
      }

    }
    async function reset() {
      console.log("重置")
      queryType.value = null;
      searchProp.value = null;
      getProjects();
    }
    async function getProjects() {
      const loading = ElLoading.service({
        lock: true,
        text: '加载数据中',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      const data = await service.get('/project/findToBeReviewedProjects');
      
      if(data){ const projects = (data as unknown as { projects: Project[] }).projects;
      ProjectTableData.value = projects
      totalItems.value=ProjectTableData.value.length
    loading.close()}else{
        ProjectTableData.value=[];
      loading.close()
    }
      console.log(totalItems)
    }
    async function checkOk(){
      try {
        // 假设 scope.row.id 是项目编号
        const projectId = rowId
        const isPass = "审核通过"
        type ProjectIdValueType = typeof projectId['value'];
        const response = await service.post('/project/updateState', {
          id: projectId.value,
          state: isPass,
          returnAddress: fileUrl.value,
        });
        ElMessage.success('审批提交成功！');
        drawer.value = false;
        getProjects(); // 更新项目列表
      } catch (error) {
        console.error('审批提交失败', error);
        ElMessage.error('审批提交失败，请稍后重试！');
      }
      drawer.value = false;
      getProjects()
    }
    async function checkNo() {
      console.log(rowId.value)
      if (!fileUrl.value) {
        ElMessage.warning('请上传相关文件后再进行审批！');
        return;
      }
      try {
        // 假设 scope.row.id 是项目编号
        const projectId = rowId
        const isPass = '审核未通过'
        const response = await service.post('/project/updateState', {
          id: projectId.value,
          state: isPass,
          returnAddress: fileUrl.value,
        });
        ElMessage.success('审批提交成功！');
        drawer.value = false;
        getProjects(); // 更新项目列表
      } catch (error) {
        console.error('审批提交失败', error);
        ElMessage.error('审批提交失败，请稍后重试！');
      }
      getProjects();
    }
    function handleDashBoardClick(row: any) {
      router.push({ name: 'dashboards', query: { projectId: row.id } });
    }
    function handlePreview(row: any) {
      rowId.value=row.id
    }
    const handleClose = (done: () => void) => {
      ElMessageBox.confirm('确定关闭评审页面？')
          .then(() => {
            done()
          })
          .catch(() => {
            // catch error
          })
    }

    return {
      Document,
      Files,
      Search,
      RefreshLeft,
      ProjectTableData,
      searchProjectData,
      direction,
      currentPage1,
      size,
      drawer,
      disabled,
      background,
      options,
      queryType,
      smallScreen,
      searchProp,
      totalItems,
      pageSize,
      currentPage,
      pagedProjects,
      fileUrl,
      drawerVisible,
      rowId,
      searchProject,
      reset,
      handleSizeChange,
      handleCurrentChange,
      handleDashBoardClick,
      handlePreview,
      handleClose,
      beforeFileUpload,
      uploadFile,
      changeFile,
      checkOk,
      checkNo,
      handleFileSuccess,
      downloadFile
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

.demo-pagination-block {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  /* 可选：添加顶部间距 */
}

.operation_shadow {
  position: relative;
  width: 100%;
  height: 80px;
  padding: 10px;
  background-color: #f0eeee;
  box-shadow: 10px 10px 10px #e1e3e700;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  font-size: 16px; /* 增加字体大小 */
}
.vedio-uploader  {

}
.vedio-uploader .el-upload__tip {
  margin-top: 10px; /* 在按钮下方添加一些间隔 */
  color: #999; /* 提示文字颜色，可根据需要调整 */
}
</style>