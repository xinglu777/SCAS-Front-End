<template>
  <div>
    <!-- 搜索栏 -->
    <el-row :gutter="5" class="filter-row" style="align-items: center;">
      <!-- 新增按钮放在输入框的左侧 -->
      <el-col :span="2">
        <el-button
            type="success"
            plain
            :disabled="role !== 'tenant'"
            @click="openAddProjectDialog"
        >
          新增项目
        </el-button>
      </el-col>
      <el-col :span="4">
        <el-input
            class="el-input"
            v-model="filters.projectName"
            placeholder="请输入项目名称"
            clearable
            style="max-width: 100%;"
        />
      </el-col>
      <el-col :span="3">
        <el-select
            class="el-select"
            v-model="filters.status"
            placeholder="状态"
            clearable
            style="max-width: 100%;"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="待评估" value="待评估"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-date-picker
            class="el-date-picker1"
            v-model="filters.startDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="起始日期:开始时间"
            end-placeholder="结束时间"
            clearable
            style="width: 90%;"
        />
      </el-col>
      <el-col :span="6">
        <el-date-picker
            class="el-date-picker1"
            v-model="filters.endDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="截止日期:开始时间"
            end-placeholder="结束时间"
            clearable
            style="width: 90%;"
        />
      </el-col>
      <el-col :span="3" style="text-align: right;">
        <el-button type="primary" icon="Search" @click="fetchProjectList">查询</el-button>
        <el-button type="default" icon="Refresh" @click="handleReset">重置</el-button>
      </el-col>
    </el-row>

    <!-- 项目卡片 -->
    <el-row :gutter="20" class="project-row" >
      <el-col :span="6" v-for="project in currentPageProjects" :key="project.projectId">
        <el-card v-if="project && project.projectName" shadow="hover" class="project-card">
          <div @click="goToDetails(project.projectName)">
            <div class="card-header">
              <img :src="project.imageUrl" class="project-image" alt="项目图片" />
            </div>
            <div class="card-body">
              <h3 class="project-title">{{ project.projectName }}</h3>
              <p class="project-description">简介:{{ extractText(project.description) }}</p >
              <p class="project-date">起始日期：{{ project.startTime || '未设置' }}</p >
              <p class="project-date">截止日期：{{ project.deadline || '未设置' }}</p >
              <div class="status-container">
                <el-tag :type="getStatusTagType(project.state)" class="status-tag">
                  {{ project.state }}
                </el-tag>
              </div>
            </div>
          </div>
          <!-- 只有当 role 为 tenant 时才显示 -->
          <div  class="card-footer">
            <el-button v-if="role === 'tenant'" type="text" size="small" @click="handleEdit(project)">修改信息</el-button>
            <el-button v-if="role === 'tenant'" type="text" size="small" @click="handleDelete(project)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>


    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          background
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="projectList.length"
          layout="prev, pager, next"
          @current-change="handlePageChange"
      />
    </div>

    <!-- 新增项目弹窗 -->
    <el-dialog :title="dialogMode === 'add' ? '新增项目' : '编辑项目'" v-model="addDialogVisible" width="60%" custom-class="custom-dialog">
      <el-form :model="newProject" label-width="100px" ref="addProjectForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="newProject.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="封面" prop="imageUrl">
              <el-upload
                  action="#"
                  list-type="picture-card"
                  :on-exceed="handleExceed"
                  :on-remove="handleImageRemove"
                  :file-list="backImg"
                  :before-upload="beforeUploadImage"
                  :on-change="handleUploadBackground"
                  :http-request="handleHttpRequest"
                  :limit="1"
                  accept="image/png,image/jpeg,image/jpg"
              >
                <i v-if="fileList.length < 1" class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 富文本编辑器部分，应用统一风格 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="项目描述" prop="description">
              <div class="editor-container">
                <quill-editor
                    v-model="editorDescriptionAdd"
                    :options="editorOptions"
                    class="quill-editor add-editor"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="需求文档" prop="requirement">
              <div class="upload-container">
                <el-upload
                    action="#"
                    list-type="text"
                    :on-remove="handleFileRemove"
                    :file-list="newProject.requirement ? [{ name: newProject.requirement, url: newProject.requirement }]: []"
                    :before-upload="beforeUploadFile"
                    :on-change="handelUploadRequirement"
                    :http-request="handleHttpRequest"
                    accept=".doc,.docx,.pdf"
                >
                  <el-button slot="trigger" type="primary">点击上传</el-button>
                </el-upload>
                <div class="upload-tip">只支持.doc, .docx, .pdf文件</div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker
                  v-model="newProject.deadline"
                  type="date"
                  placeholder="请选择截止日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch,nextTick  } from "vue";
import { ElMessage } from "element-plus";
import {
  addProject, deleteProject, getProjectsByTenant, updateProject, uploadRequirement,
  uploadBackgroundImage, uploadContent, listProjectsByUser
} from "@/api/apiList/project";
import {getTenantInfo} from "@/api/apiList/tenant";
import axios from "axios";
import { QuillEditor } from "@vueup/vue-quill";
import { Plus } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import {setup} from "vue-class-component";
import router from "@/router";
import {deleteMeeting} from "@/api/apiList/meeting";
axios.defaults.withCredentials = true;

interface Project {
  projectId?: number| null;
  projectName: string;
  tenantId: number;
  imageUrl: string;
  description: string;
  creator: string;
  requirement: string;
  startTime?: Date | null | string;
  deadline?: Date | null | string;
  completedTime?: Date | null | string;
  state: string;
}


// 从 localStorage 获取用户信息
const userInfoString = localStorage.getItem("userInfo");
const role = localStorage.getItem("userRole");
const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
const projectList = ref<Project[]>([]);
const currentPage = ref(1);
const addDialogVisible = ref(false);
const editorDescriptionAdd = ref('');
// 新增一个用于存储文件列表的 ref
const fileList = ref([]);
const backImg = ref([]);
const dialogMode = ref<'add' | 'edit'>('add');
const d = ref(1);
const pageSize = ref(4);
const currentCreator = ref("");
const isQuillInitialized = ref(false);
const addProjectForm = ref(null); // 定义表单引用
const requirementName = ref(null);
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{'header': [1, 2, false]}],
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      [{'script': 'sub'}, {'script': 'super'}],
      [{'indent': '-1'}, {'indent': '+1'}],
      [{'direction': 'rtl'}],
      [{'size': ['small', false, 'large', 'huge']}],
      [{'header': [1, 2, 3, 4, 5, 6, false]}],
      [{'color': []}, {'background': []}],
      [{'font': []}],
      [{'align': []}],
      ['clean'],
      ['link', 'image', 'video']
    ]
  }
};
const filters = ref({
  projectName: "",
  status: "",
  startDateRange: null as [Date, Date] | null,
  endDateRange: null as [Date, Date] | null,
});

const goToDetails = (projectName) => {
  if (!projectName) {
    console.error('项目名称未定义');
    return;
  }
  router.push(`/project/details/${projectName}`);
};


const handleEdit = (project: Project) => {
  dialogMode.value = 'edit';
  newProject.value = { ...project }; // 填充表单数据
  editorDescriptionAdd.value = project.description;

  // 输出查看赋值情况

  console.log("editorDescriptionAdd 被赋值为:", editorDescriptionAdd.value);

  fileList.value = project.requirement ? [{ name: project.requirement, url: project.requirement }] : [];
  addDialogVisible.value = true;
  backImg.value = project.imageUrl ? [{ name: project.imageUrl, url: project.imageUrl }] : [];
  console.log("newProject 被赋值为:", newProject.value);
  console.log("backImg 被赋值为:", backImg.value);
  // 确保在对话框显示之后再更新富文本编辑器内容
  nextTick(() => {
    const quillEditor = document.querySelector('.quill-editor');
    if (quillEditor && quillEditor.__quill) {
      // 使用 innerHTML 设置编辑器内容，保留富文本格式
      quillEditor.__quill.root.innerHTML = editorDescriptionAdd.value;
      console.log("富文本内容重新赋值:", editorDescriptionAdd.value);
      quillEditor.__quill.on('text-change', () => {
        editorDescriptionAdd.value = quillEditor.__quill.root.innerHTML;
        newProject.value.description = editorDescriptionAdd.value; // 手动同步
        console.log("更新后的内容：", newProject.value.description);
      });
    }
  });
};



// 初始化 newProject
const newProject = ref<Project>({
  projectId:null,
  projectName: "", // 项目名称
  tenantId: userInfo.tenantId || 0, // 从 userInfo 动态获取 tenantId，默认为 0
  imageUrl: "", // 项目封面图片
  description: "", // 项目描述
  requirement: "", // 项目需求文档
  creator: userInfo.tenantName || "未知租户", // 从 userInfo 动态获取 tenantName
  startTime: new Date().toISOString(), // 当前时间
  deadline: "", // 项目截止日期
  state: "待评估", // 默认状态
});
// 初始化 newProject
const editedProject = ref<Project>({} as Project);
const openAddProjectDialog = () => {
  dialogMode.value = 'add';
  resetNewProject();
  // 重置文件列表
  fileList.value = [];
  backImg.value = [];
  // 打印重置后的项目数据
  console.log("重置后的 editorDescriptionAdd 数据:", editorDescriptionAdd.value);
  console.log("重置后的 newProject 数据:", newProject.value);
  addDialogVisible.value = true;
  nextTick(() => {
    if (!isQuillInitialized.value) { // 确保 Quill 只初始化一次
      const quillEditor = document.querySelector('.quill-editor') as any;
      if (quillEditor && quillEditor.__quill) {
        console.log("Quill Editor 打开对话框初始化成功！");
        console.log("初始内容：", quillEditor.__quill.root.innerHTML);

        quillEditor.__quill.on('text-change', () => {
          editorDescriptionAdd.value = quillEditor.__quill.root.innerHTML;
          newProject.value.description = editorDescriptionAdd.value;
          console.log("更新后的内容：", newProject.value.description);
        });

        isQuillInitialized.value = true; // 设置初始化完成的标志
      } else {
        console.error("Quill Editor 打开对话框初始化失败！");
      }
    }
  });
};

function extractText(content:any) {
  // 创建一个临时的div元素来解析HTML内容
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // 提取文本内容
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  // 进行内容概括，比如只取前100个字符
  return textContent.length > 50 ? textContent.substring(0, 50) + "..." : textContent;
}

// 添加watch代码
watch(
    () => newProject.value.description, // 监听description字段
    (newVal) => {
      console.log("当前description绑定值：", newVal); // 每当description变化时，打印新值

    }
);

// 添加watch代码，监听projectName字段
watch(
    () => newProject.value.projectName,
    (newVal) => {
      console.log("当前projectName绑定值：", newVal); // 每当projectName变化时，打印新值
      console.log("当前description绑定值：", newProject.value.description);
      console.log("当前deadline绑定值：", newProject.value.deadline);
    }
);

if (userInfoString) {
  try {
    // 解析 userInfo 字符串为对象
    const userInfo = JSON.parse(userInfoString);

    // 获取 tenantId 和 tenantName
    const tenantId = userInfo.tenantId; // 动态获取 tenantId
    const creator = userInfo.tenantName; // 动态获取租户名称（tenantName）

    // if (!tenantId || !creator) {
    //   ElMessage.error("未找到租户信息，请重新登录！");
    //   router.push({ path: "/login" });
    // }
  } catch (error) {
    console.error("解析 userInfo 出错:", error);
    ElMessage.error("用户信息解析失败，请重新登录！");
    router.push({ path: "/login" });
  }
} else {
  ElMessage.error("未找到用户信息，请重新登录！");
  router.push({ path: "/login" });
}

const rules = {
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  imageUrl: [{ required: true, message: "请上传封面图片", trigger: "change" }],
  description: [{ required: true, message: "请输入项目描述", trigger: "blur" }],
  requirement: [{ required: true, message: "请上传需求文档", trigger: "change" }],
  deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
};


// 在表单提交时：
const formRef = ref(null);

const handleUploadError = (error) => {
  console.error("图片上传失败：", error);
  ElMessage.error("图片上传失败，请稍后重试！");
};

const handleImageRemove = (file) =>{
  console.log("删除图片：", file);
  newProject.value.imageUrl = ""; // 清除图片 URL
  ElMessage.success("图片已删除！");
}


const submitForm = async () => {
  newProject.value.description = editorDescriptionAdd.value;
  console.log("富文本内容：", newProject.value.description);
  console.log("准备提交数据：", newProject.value);
  if (!addProjectForm.value) return;

  try {
    await addProjectForm.value.validate();

    // const content = newProject.value.description;
    //
    // const div = document.createElement("div");
    // console.log("Quill内容：", content);
    //
    // div.innerHTML = content;
    //
    // const images = div.querySelectorAll("img");
    // images.forEach((img) => {
    //   img.style.maxWidth = "100%";
    //   img.style.height = "auto";
    // });
    const quillEditor = document.querySelector('.quill-editor');
    var htmlContent = quillEditor.__quill.root.innerHTML;
    console.log("htmlContent:"+htmlContent);
    var blob = new Blob([htmlContent], { type: 'text/html' });
    const timestamp = Date.now();
    var file = new File([blob], timestamp+".html", { type: 'text/html' });
    uploadContent(file,0)
        .then(response => {
          if (response && response.data){
            newProject.value.description = response.data;
            console.log(newProject.value.description);
          }else{
            console.log("富文本上传失败");
          }
        })

    // newProject.value.description = div.innerHTML;

    console.log("验证通过，提交数据：", newProject.value);

    if (dialogMode.value === 'add') {
      const response = await addProject(newProject.value);
      if (response.code === 1000) {
        ElMessage.success("项目添加成功！");
      } else {
        ElMessage.error(response.message || "项目添加失败，请稍后重试！");
      }
    } else if (dialogMode.value === 'edit') {
      const response = await updateProject(newProject.value);
      if (response.code === 1000) {
        ElMessage.success("项目编辑成功！");
      } else {
        ElMessage.error(response.message || "项目编辑失败，请稍后重试！");
      }
    }
    addDialogVisible.value = false;
    fetchProjects();
  } catch (err) {
    console.error("验证失败：", err);
    ElMessage.error("请完善表单信息！");
  }
};

// const submitForm = async () => {
//   if (!addProjectForm.value) return;
//
//   try {
//     await addProjectForm.value.validate();
//
//     // 强制同步富文本内容（从 Quill 实例中读取）
//     const quillEditor = document.querySelector('.quill-editor') as any;
//     if (quillEditor && quillEditor.__quill) {
//       newProject.value.description = quillEditor.__quill.root.innerHTML;
//     }
//
//     console.log("最终提交的项目数据：", newProject.value);
//
//     // 提交数据到后端
//     const response = await addProject(newProject.value);
//
//     if (response.code === 1000) {
//       ElMessage.success("项目添加成功！");
//       addDialogVisible.value = false;
//       fetchProjects();
//     } else {
//       ElMessage.error(response.message || "项目添加失败，请稍后重试！");
//     }
//   } catch (err) {
//     console.error("验证失败或提交异常：", err);
//     ElMessage.error("请完善表单信息！");
//   }
// };



const currentPageProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProjects.value.slice(start, end);
});

const handleExceed = (files, backImg) => {
  ElMessage.error('只能上传一张封面图片！'); // 当用户超过上传限制时提示
};

const resetNewProject = () => {
  Object.assign(newProject.value, {
    projectName: "",
    tenantId: userInfo.tenantId || 0,
    imageUrl: "",
    description: "",
    requirement: "",
    creator: userInfo.tenantName || "未知租户",
    startTime: new Date().toISOString(),
    deadline: "",
    state: "待评估",
  });
  editorDescriptionAdd.value = ''; // 重置富文本编辑器内容
  isQuillInitialized.value = false; // 重置初始化状态，确保下次可以重新初始化
  // 清空上传文件列表
  const uploadComponent = document.querySelector('.el-upload');
  if (uploadComponent && uploadComponent.__vue__) {
    uploadComponent.__vue__.clearFiles(); // 调用 Element UI 的 clearFiles 方法
  }

  // 清空富文本编辑器的内容
  nextTick(() => {
    const quillEditor = document.querySelector('.quill-editor');
    if (quillEditor && quillEditor.__quill) {
      quillEditor.__quill.setText(''); // 清空编辑器内容
    }
  });
};

const filteredProjects = computed(() => {
  return projectList.value.filter((project) => {
    const matchesName = filters.value.projectName
        ? project.projectName.includes(filters.value.projectName)
        : true;

    const matchesStatus = filters.value.status
        ? filters.value.status === "进行中"
            ? project.state === "审核未通过" || project.state === "待审核"
            : filters.value.status === "已完成"
                ? project.state === "评估完成" || project.state === "审核通过"
                : project.state === filters.value.status
        : true;

    const matchesStartDate = filters.value.startDateRange
        ? new Date(project.startTime || "") >= filters.value.startDateRange[0] &&
        new Date(project.startTime || "") <= filters.value.startDateRange[1]
        : true;
    const matchesEndDate = filters.value.endDateRange
        ? new Date(project.deadline || "") >= filters.value.endDateRange[0] &&
        new Date(project.deadline || "") <= filters.value.endDateRange[1]
        : true;

    return matchesName && matchesStatus && matchesStartDate && matchesEndDate;
  });
});

// const handleImageUploadSuccess = (response: any) => {
//   console.log("图片上传成功返回数据：", response);
//   if (response && response.success && response.url) {
//     ElMessage.success("图片上传成功！");
//     newProject.value.imageUrl = response.url; // 更新图片 URL
//   } else {
//     ElMessage.error("图片上传失败，返回数据格式不正确！");
//     console.error("图片上传返回数据错误：", response);
//   }
// };

const handleFileRemove = () => {
  newProject.value.requirement = ""; // 清空文档字段
};

// const handleFileUploadSuccess = (response: any) => {
//   console.log("文档上传成功返回数据：", response);
//   if (response && response.success && response.url) {
//     ElMessage.success("文档上传成功！");
//     newProject.value.requirement = response.url; // 更新文档 URL
//   } else {
//     ElMessage.error("文档上传失败，返回数据格式不正确！");
//     console.error("文档上传返回数据错误：", response);
//   }
// };

const beforeUploadImage = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error("上传的文件必须是图片格式");
  }
  if (!isLt2M) {
    ElMessage.error("上传的图片大小不能超过2MB");
  }
  if(backImg.value.length > 1){
    ElMessage.warning("只能上传一张封面图片！");
    return false; // 停止上传
  }
  return isImage && isLt2M;
};

const handleUploadBackground = (file : any) => {
  console.log("上传图片");
  if (file == null){
    console.log("上传图片为空")
    newProject.value.imageUrl = "";
    return
  }else{
    const originalFileName = file.raw.name;
    const timestamp = Date.now();
    const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
    const newFileName = `${originalFileName.split('.')[0]}_${timestamp}${fileExtension}`;
    const newFile = new File([file.raw], newFileName, { type: file.type });
    uploadBackgroundImage(newFile, 0)
        .then(response => {
          if(response){
            console.log("上传图片成功！！！");
            newProject.value.imageUrl = response.data;
            console.log(newProject.value.imageUrl);
          }else{
            console.log("上传图片失败111");
            ElMessage.error("上传图片失败");
          }
        })
  }
}

const beforeUploadFile = (file: File) => {
  const isAllowed = ["application/pdf", "application/msword"].includes(file.type);
  const isLt50M = file.size / 1024 / 1024 < 5;
  if (!isAllowed) {
    // ElMessage.error("只支持上传.doc, .docx, .pdf文件");
  }
  if (!isLt50M) {
    ElMessage.error("文件大小不能超过50MB");
  }
  return isAllowed && isLt50M;
};

const handelUploadRequirement = (file: any) => {
  console.log(file.raw.name);
  const originalFileName = file.raw.name;
  const timestamp = Date.now();
  const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
  const newFileName = `${originalFileName.split('.')[0]}_${timestamp}${fileExtension}`;
  const newFile = new File([file.raw], newFileName, { type: file.type });
  uploadRequirement(newFile,0)
      .then(response => {
        if (response && response.data){
          newProject.value.requirement = response.data;
        } else{
          console.error("上传失败");
          ElMessage.error("上传失败");
        }
      })
};

const handleHttpRequest = () => {
  return Promise.resolve();
};


  const getStatusTagType = (status: string): string => {
    const statusColors = {
      "待评估": "warning", // 黄色
      "审核未通过": "danger", // 红色
      "待审核": "primary", // 蓝色
      "评估完成": "success", // 绿色
      "审核通过": "success", // 绿色
    };
    return statusColors[status as keyof typeof statusColors] || "default";
  };


const fetchProjects = async () => {
  try {
    // 获取用户信息
    const userInfoString = localStorage.getItem("userInfo");
    if (!userInfoString) {
      if(role === 'tenant'){
        ElMessage.error("租户未登录，请重新登录");
        console.error("租户未登录，未找到 userInfo");
      }else{
        ElMessage.error("用户未登录，请重新登录");
        console.error("用户未登录，未找到 userInfo");
      }
      return;
    }

    const userInfo = JSON.parse(userInfoString);

    // 调试输出 userInfo
    console.log("Fetched userInfo from localStorage:", userInfo);
    console.log("Fetched userInfoID from localStorage:", userInfo.userId);
    if(role === 'tenant'){
      if (!userInfo.tenantId) {
        ElMessage.error("租户ID不存在，请重新登录");
        return;
      }
    }else{
      if (!userInfo.userId) {
        ElMessage.error("用户ID不存在，请重新登录");
        return;
      }
    }
    // 调用 API 获取项目数据
    if(role === 'tenant'){
      console.log("Calling API with tenantId:", userInfo.tenantId);
      const data  = await getProjectsByTenant(userInfo.tenantId);
      console.log("API response直接返回的:", await getProjectsByTenant(userInfo.tenantId));
      // 调试输出 API 响应
      console.log("API response:", data);
      if (data.code === 1000) {
        projectList.value = data.data;
        console.log("Project list fetched successfully:", projectList.value);
      } else {
        ElMessage.error(data.message || "获取会议列表失败");
        console.error("API Error:", data.message || "Unknown error");
      }
    }else{
      console.log("Calling API with userId:", userInfo.userId);
      console.log("userid"+userInfo.userId)
      const data  = await listProjectsByUser(userInfo.userId);
      console.log("API response直接返回的:", await listProjectsByUser(userInfo.userId));
      // 调试输出 API 响应
      console.log("API response:", data);
      if (data.code === 1000) {
        projectList.value = data.data;
        console.log("Project list fetched successfully:", projectList.value);
      } else {
        ElMessage.error(data.message || "获取会议列表失败");
        console.error("API Error:", data.message || "Unknown error");
      }
    }
  }
  catch (error) {
    ElMessage.error("获取会议列表失败，请稍后重试");
    console.error("Error fetching projects:", error);
  }
};


const handlePageChange = (page: number) => {
  currentPage.value = page;
};


const handleDelete = async (project: Project) => {
  try {
    const response = await deleteProject(`${project.projectId}`);
    if(response.code === 1000){
      console.log("删除项目返回值", response);
      ElMessage.success(`删除项目成功：${project.projectId}`);
      fetchProjects();
      currentPage.value = 1;
    }
    else{
      ElMessage.error(`项目${project.projectId}删除失败`);
      console.log("删除项目返回值", response);
    }
  } catch (error) {
    ElMessage.error(`项目${project.projectId}删除失败`);
    console.error('项目删除失败:', error);
  }
};

const handleReset = () => {
  filters.value.projectName = "";
  filters.value.status = "";
  filters.value.startDateRange = null;
  filters.value.endDateRange = null;
  fetchProjects();
};


onMounted(() => {
  fetchProjects();
  // nextTick(() => {
  //   const quillEditor = document.querySelector('.quill-editor') as any;
  //   if (quillEditor && quillEditor.__quill) {
  //     console.log("Quill Editor 初始化成功！");
  //     console.log("初始内容：", quillEditor.__quill.root.innerHTML);
  //   } else {
  //     console.error("Quill Editor 初始化失败！");
  //   }
  // });
});

// onMounted(() => {
//   fetchCurrentUser().then(() => fetchProjectList());
// });
</script>

<style scoped>
::v-deep(.el-card__body) {
  padding: 0; /* 移除默认内边距 */
}

.project-row {
  margin-top: 20px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.upload-container {
  display: flex;
  align-items: center;
}

.upload-tip {
  margin-left: 10px; /* 调整间距，保证按钮和提示信息之间的距离 */
  color: #666; /* 提示信息的颜色 */
}

.project-card {
  border-radius: 0px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.card-header {
  width: 100%;
}
.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
/* 缩短输入框和选择器的宽度 */
.filter-row .el-input,
.filter-row .el-select{
  font-size: 14px;
  padding: 4px;
}

.filter-row .el-date-picker1 {
  font-size: 14px;
  padding: 4px;
  width: 70px;
}
.card-body {
  padding-top: 15px;
  padding-bottom: 15px;
}
.project-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}
.project-description {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}
.project-date {
  font-size: 13px;
  color: #999;
}
.status-container {
  margin-top: 10px;
}
.card-footer {
  padding: 10px 0px;
  display: flex;
  justify-content: space-between;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.pagination-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}
</style>
