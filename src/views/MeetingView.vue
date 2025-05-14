<template>
  <div>
    <!-- 搜索和过滤栏 -->
    <el-row :gutter="20" class="filter-row">
      <el-col :span="6">
        <el-form-item label="会议名称">
          <el-input v-model="filters.name" placeholder="请输入会议名称" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="创建人">
          <el-input v-model="filters.creator" placeholder="创建人" />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="开始时间">
          <el-input v-model="filters.startTime" placeholder="请输入开始时间" />
        </el-form-item>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" plain icon="Refresh" @click="handleReset">重置</el-button>
      </el-col>
    </el-row>

    <!-- 操作按钮栏 -->
    <el-row :gutter="20" class="button-row">
      <el-col :span="2">
        <el-button type="primary" plain icon="Plus" @click="openAdd">添加</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="success" plain icon="Edit" @click="handleEditSelected">修改</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="danger" plain icon="Delete" @click="handleDeleteSelected">删除</el-button>
      </el-col>
      <el-col :span="2">
        <el-button type="warning" plain icon="Upload" @click="handleExport">导出</el-button>
      </el-col>
    </el-row>

    <!-- 会议表格 -->
    <el-table :data="currentPageMeeting" style="width: 100%" @selection-change="handleSelectionChange" ref="meetingTable">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="会议名称" align="center">
        <template #default="scope">
          <el-link @click="viewDetail(scope.row)" type="primary">{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" align="center" />
      <el-table-column prop="state" label="会议状态" align="center">
        <template #default="scope">
    <span :style="{ color: getStatusColor(scope.row.state) }">
      {{ scope.row.state }}
    </span>
        </template>
      </el-table-column>

      <el-table-column prop="content" label="会议内容" align="center">
        <template #default="scope">
          <div>{{ extractText(scope.row.content) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" align="center" />
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" icon="Edit" @click="initiateEdit(row)">修改</el-button>
          <el-button link type="danger" size="small" icon="Delete" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container" style="display: flex; justify-content: center;">
      <el-pagination
          background2
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="meetingList.length"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <!-- 添加会议 -->
    <el-dialog title="添加会议" v-model="addDialogueVisibility" width="70%" custom-class="custom-dialog">
      <el-form :model="addedMeeting" :rules="addRule" ref="meetingForm" label-width="100px" custom-class="custom-form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议名称" prop="name">
              <el-input v-model="addedMeeting.name" placeholder="请输入会议名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议封面" prop="imageUrl">
              <el-upload
                  action="http://localhost:9003/upload"
                  list-type="picture-card"
                  :on-success="handleSuccess"
                  :on-remove="handleRemove"
                  :file-list="editedMeeting.imageUrl ? [{ name: addedMeeting.imageUrl, url: addedMeeting.imageUrl }]: []"
                  :before-upload="beforeUpload"
                  accept="image/png,image/jpeg,image/jpg"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 富文本编辑器部分 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议内容" prop="content">
              <quill-editor v-model="editorContentAdd" :options="editorOption" class="quill-editor add-editor" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 作者，会议简介，选择租户部分 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建人" prop="creator">
              <el-input v-model="addedMeeting.creator" placeholder="请输入创建人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                  v-model="addedMeeting.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :disabled-date="disabledStartDate"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                  v-model="addedMeeting.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="addDialogueVisibility = false">取消</el-button>
          <el-button type="primary" @click="handleAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改会议 -->
    <el-dialog title="修改会议" v-model="editDialogueVisibility" width="70%" custom-class="custom-dialog">
      <el-form :model="editedMeeting" :rules="addRule" ref="editNewsForm" label-width="100px" custom-class="custom-form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议名称" prop="name">
              <el-input v-model="editedMeeting.name" placeholder="请输入会议名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议封面" prop="imageUrl">
              <el-upload
                  action="http://localhost:9003/upload"
                  list-type="picture-card"
                  :on-success="handleSuccess"
                  :on-remove="handleRemove"
                  :file-list="addedMeeting.imageUrl ? [{ name: editedMeeting.imageUrl, url: editedMeeting.imageUrl }] : []"
                  :before-upload="beforeUpload"
                  accept="image/png,image/jpeg,image/jpg"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 富文本编辑器部分 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="会议内容" prop="content">
              <quill-editor v-model="editorContentEdit" :options="editorOption" class="quill-editor edit-editor" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 作者，会议简介，选择租户部分 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建人" prop="creator">
              <el-input v-model="editedMeeting.creator" placeholder="请输入创建人"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                  v-model="editedMeeting.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :disabled-date="disabledStartDate"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                  v-model="editedMeeting.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="editDialogueVisibility = false">取消</el-button>
          <el-button type="primary" @click="handleEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 会议详情 -->
    <el-dialog title="会议详情" v-model="detailDialogVisible" width="70%">
      <div class="meeting-detail">
        <div class="meeting-section">
          <p class="meeting-name"><strong>{{ selectedMeeting.name }}</strong></p>
          <hr />
          <p><strong>创建者：</strong>{{ selectedMeeting.creator }}</p>
          <hr />
          <p><strong>开始时间：</strong>{{ formatDate(selectedMeeting.startTime) }}</p>
          <hr />
          <p><strong>内容：</strong></p>
          <div class="rich-text-content" v-html="selectedMeeting.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
axios.defaults.withCredentials = true;
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars


import { ref, onMounted, computed, nextTick, UnwrapRef } from 'vue';
import { getAllMeeting, searchMeeting, createMeeting, deleteMeeting, updateMeeting, getUserInfo } from '../api/apiList/meeting';
import { getAllTenants } from '@/api/apiList/tenant';
import {
  ElTable, ElTableColumn, ElButton, ElInput, ElRow, ElCol, ElDialog, ElForm,
  ElFormItem, ElMessage, ElPagination, ElMessageBox, ElUpload, ElIcon, FormInstance, dayjs
} from 'element-plus';
import { Search, Plus, Edit, Delete, Refresh, Upload } from '@element-plus/icons-vue';
import { QuillEditor,Quill} from '@vueup/vue-quill';
import * as XLSX from 'xlsx';


interface MeetingData {
  id?: number;
  name: string;
  imageUrl: string;
  content: string;
  creator: string;
  startTime: Date | null | string;
  endTime: Date | null | string;
  state: string;
  userName: string;
}

interface TenantData {
  tenantId: number;
  tenantName: string;
}

const currentUser = ref<{ userName: string }>({ userName: '' });
const currentMeeting = ref<MeetingData>({} as MeetingData);
const meetingList = ref<MeetingData[]>([]);
const filters = ref<Partial<MeetingData>>({ name: '', creator: '', startTime: null });
const selectedRows = ref<MeetingData[]>([]);
const addDialogueVisibility = ref(false);
const editDialogueVisibility = ref(false);
const detailDialogVisible = ref(false);
const selectedMeeting = ref<MeetingData>({} as MeetingData);
const addedMeeting = ref<MeetingData>({
  name: '',
  imageUrl: '',
  content: '',
  creator: '',
  startTime: '',
  endTime: '',
  state: '',
  userName: currentUser.value.userName || ''
});
const editedMeeting = ref<MeetingData>({} as MeetingData);
const editorContentAdd = ref('');
const editorContentEdit = ref('');
const tenants = ref<TenantData[]>([]);
const pageSize = ref(8);
const currentPage = ref(1);

const currentPageMeeting = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return meetingList.value.slice(start, end);
});

onMounted(() => {
  fetchUserInfo();
  fetchMeetingList();
  fetchTenantList();
});

// 初始化编辑
const initiateEdit = async (row: MeetingData) => {
  try {
    let response: any = await searchMeeting({ name: row.name });
    console.log('fetchEditMeetingInfo response:', response); // 添加日志

    if (response.code === 1000) {
      const meeting = response.data[0]; // 假设会议名称唯一，取第一个匹配的会议
      if (meeting) {
        currentMeeting.value = meeting;
        console.log('currentMeeting userName:', currentMeeting.value.userName); // 添加日志输出

        if (currentMeeting.value.userName === currentUser.value.userName || currentUser.value.userName === "admin") {
          openEdit(currentMeeting.value); // 调用编辑方法并传递会议信息
        } else {
          ElMessage.error('您没有权限编辑此会议');
        }
      } else {
        ElMessage.error('未找到匹配的会议');
      }
    } else {
      ElMessage.error('获取当前会议信息失败');
    }
  } catch (error) {
    ElMessage.error('搜索会议失败');
  }
};

const fetchUserInfo = async () => {
  try {
    let response: any = await getUserInfo();
    console.log('fetchUserInfo response:', response); // 添加日志
    if (response.code === 1000) {
      currentUser.value = response.data;
      console.log('currentUser:', currentUser.value); // 添加日志输出
    } else {
      ElMessage.error('获取用户信息失败');
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
    console.error('获取用户信息失败:', error);
  }
};

const getStatusColor = (status:any) => {
  return status === '进行中' ? 'green' : 'red';
};

const fetchMeetingList = async () => {
  try {
    let response: any = await getAllMeeting();
    console.log('fetchMeetingList response:', response); // 添加日志
    if (response.code === 1000) {
      meetingList.value = response.data;
    } else {
      ElMessage.error('获取会议列表失败');
    }
  } catch (error) {
    ElMessage.error('获取会议列表失败');
    console.error('获取会议列表失败:', error);
  }
};

const beforeUpload = (file:any) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 或 IPEG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const fetchTenantList = async () => {
  try {
    let response: any = await getAllTenants();
    console.log('fetchTenantList response:', response); // 添加日志
    tenants.value = response.data;
  } catch (error) {
    ElMessage.error('获取租户列表失败');
    console.error('获取租户列表失败:', error);
  }
};

const handleSearch = async () => {
  try {
    let response: any = await searchMeeting(filters.value);
    console.log('handleSearch response:', response); // 添加日志
    meetingList.value = response.data;
    currentPage.value = 1;
  } catch (error) {
    ElMessage.error('搜索会议失败');
    console.error('搜索会议失败:', error);
  }
};



const handleReset = () => {
  filters.value = { name: '', creator: '', startTime: null };
  fetchMeetingList();
  currentPage.value = 1;
};

const handleAdd = async () => {
  try {
    // 获取编辑器内容
    let content = editorContentAdd.value;

    // 创建一个 DOM 元素用于处理内容
    let div = document.createElement('div');
    div.innerHTML = content;

    // 选择所有图片并调整大小
    let images = div.querySelectorAll('img');
    images.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });

    // 更新内容
    addedMeeting.value.content = div.innerHTML;

    // 检查必填项
    if (!addedMeeting.value.name) {
      ElMessage.error('请填写会议名称');
      return;
    }
    if (!addedMeeting.value.creator) {
      ElMessage.error('请填写创建者');
      return;
    }
    if (!addedMeeting.value.startTime) {
      ElMessage.error('请选择开始时间');
      return;
    }
    if (!addedMeeting.value.endTime) {
      ElMessage.error('请选择结束时间');
      return;
    }
    if (!addedMeeting.value.content) {
      ElMessage.error('请填写会议内容');
      return;
    }

    // 检查时间逻辑
    let startTime = new Date(addedMeeting.value.startTime).getTime();
    let endTime = new Date(addedMeeting.value.endTime).getTime();
    let currentTime = new Date().getTime();

    if (startTime > currentTime) {
      ElMessage.error('开始时间不能晚于当前时间');
      return;
    }

    if (endTime <= startTime) {
      ElMessage.error('开始时间不能晚于或等于结束时间');
      return;
    }
    addedMeeting.value.state = endTime > currentTime ? '进行中' : '已结束';
    addedMeeting.value.startTime = addedMeeting.value.startTime ? String(addedMeeting.value.startTime) : null;
    addedMeeting.value.endTime = addedMeeting.value.endTime ? String(addedMeeting.value.endTime) : null;
    addedMeeting.value.userName = currentUser.value.userName || ''; // 在这里进行赋值
    const response = await createMeeting(addedMeeting.value);
    ElMessage.success('会议添加成功');
    addDialogueVisibility.value = false;
    fetchMeetingList();
    currentPage.value = 1;
  } catch (error) {
    ElMessage.error('会议添加失败');
    console.error('会议添加失败:', error);
  }
};


const disabledStartDate = (time:Date) => {
  return time.getTime() > Date.now();
};

const confirmDelete = async (row: MeetingData) => {
  try {
    let response: any = await searchMeeting({ name: row.name });
    console.log('fetchDeleteMeetingInfo response:', response); // 添加日志

    if (response.code === 1000) {
      const meeting = response.data[0]; // 假设会议名称唯一，取第一个匹配的会议
      if (meeting) {
        currentMeeting.value = meeting;
        console.log('currentMeeting userName:', currentMeeting.value.userName); // 添加日志输出

        if (currentMeeting.value.userName === currentUser.value.userName || currentUser.value.userName === "admin") {
          ElMessageBox.confirm(`确认删除会议名称为 "${row.name}" 的会议吗？`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            handleDelete(row);
          }).catch(() => {
            ElMessage.info('已取消删除');
          });
        } else {
          ElMessage.error('您没有权限删除此会议');
        }
      } else {
        ElMessage.error('未找到匹配的会议');
      }
    } else {
      ElMessage.error('获取当前会议信息失败');
    }
  } catch (error) {
    ElMessage.error('搜索会议失败');
  }
};

const handleDelete = async (row: MeetingData) => {
  try {
    await deleteMeeting(row.id!);
    ElMessage.success('会议删除成功');
    fetchMeetingList();
    currentPage.value = 1;
  } catch (error) {
    ElMessage.error('会议删除失败');
    console.error('会议删除失败:', error);
  }
};

const handleDeleteSelected = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.error('请选择要删除的会议');
    return;
  }

  ElMessageBox.confirm('确认删除选中的会议吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    // 用于存储没有权限删除的会议名称
    const unauthorizedMeetings: string[] = [];

    for (const row of selectedRows.value) {
      let response: any = await searchMeeting({ name: row.name });
      console.log('fetchDeleteMeetingInfo response:', response); // 添加日志

      if (response.code === 1000) {
        const meeting = response.data[0]; // 假设会议名称唯一，取第一个匹配的会议
        if (meeting) {
          currentMeeting.value = meeting;
          console.log('currentMeeting userName:', currentMeeting.value.userName); // 添加日志输出

          if (currentMeeting.value.userName === currentUser.value.userName || currentUser.value.userName === "admin") {
            await handleDelete(row); // 调用删除方法
          } else {
            unauthorizedMeetings.push(row.name);
          }
        } else {
          ElMessage.error('未找到匹配的会议');
        }
      } else {
        ElMessage.error('获取当前会议信息失败');
      }
    }

    if (unauthorizedMeetings.length > 0) {
      ElMessage.error(`您没有权限删除以下会议：${unauthorizedMeetings.join(', ')}`);
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};


const viewDetail = (row: MeetingData) => {
  selectedMeeting.value = { ...row };
  detailDialogVisible.value = true;
};

const handleEditSelected = () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.error('请选中一条会议进行修改');
    return;
  }
  initiateEdit(selectedRows.value[0]);
};

const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.error('请选择要导出的会议');
    return;
  }
  const exportData = selectedRows.value.map(meeting => ({
    id: meeting.id,
    name: meeting.name,
    content: meeting.content,
    creator: meeting.creator,
    startTime: meeting.startTime,
    state: meeting.state
  }));
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "会议列表");
  XLSX.writeFile(workbook, "meeting.xlsx");
};

const openEdit = (row: MeetingData) => {
  Object.assign(editedMeeting.value, row);
  editorContentEdit.value = row.content;
  editDialogueVisibility.value = true;
  nextTick(() => {
    const quillEditor = document.querySelector('.quill-editor.edit-editor') as any;
    if (quillEditor) {
      quillEditor.__quill.root.innerHTML = editorContentEdit.value;
      quillEditor.__quill.on('text-change', () => {
        editorContentEdit.value = quillEditor.__quill.root.innerHTML;
        editedMeeting.value.content = editorContentEdit.value;
      });
    }
  });
};

const openAdd = () => {
  Object.assign(addedMeeting.value, {
    name: '',
    imageUrl: null,
    content: '',
    creator: '',
    startTime: new Date(),
    endTime: new Date(),
    state: '进行中',
    userName: currentUser.value.userName || ''
  });
  editorContentAdd.value = '';
  addDialogueVisibility.value = true;
  nextTick(() => {
    const quillEditor = document.querySelector('.quill-editor.add-editor') as any;
    if (quillEditor) {
      quillEditor.__quill.root.innerHTML = '';
      quillEditor.__quill.on('text-change', () => {
        editorContentAdd.value = quillEditor.__quill.root.innerHTML;
        addedMeeting.value.content = editorContentAdd.value;
      });
    }
  });
};

const handleSelectionChange = (val: MeetingData[]) => {
  selectedRows.value = val;
};

const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchMeetingList();
};

const handleEdit = async () => {
  try {
    editedMeeting.value.content = editorContentEdit.value;
    // 检查必填项
    if (!editedMeeting.value.name) {
      ElMessage.error('请填写会议名称');
      return;
    }
    if (!editedMeeting.value.creator) {
      ElMessage.error('请填写创建者');
      return;
    }
    if (!editedMeeting.value.startTime) {
      ElMessage.error('请选择开始时间');
      return;
    }
    if (!editedMeeting.value.endTime) {
      ElMessage.error('请选择结束时间');
      return;
    }
    if (!editedMeeting.value.content) {
      ElMessage.error('请填写会议内容');
      return;
    }


    // 检查时间逻辑
    let startTime = new Date(editedMeeting.value.startTime).getTime();
    let endTime = new Date(editedMeeting.value.endTime).getTime();
    let currentTime = new Date().getTime();

    if (startTime > currentTime) {
      ElMessage.error('开始时间不能晚于当前时间');
      return;
    }

    if (endTime <= startTime) {
      ElMessage.error('开始时间不能晚于或等于结束时间');
      return;
    }

    editedMeeting.value.state = endTime > currentTime ? '进行中' : '已结束';

    editedMeeting.value.startTime = editedMeeting.value.startTime ? String(editedMeeting.value.startTime) : null;
    editedMeeting.value.endTime = editedMeeting.value.endTime ? String(editedMeeting.value.endTime) : null;
    await updateMeeting(editedMeeting.value.id!, editedMeeting.value);
    ElMessage.success('会议修改成功');
    editDialogueVisibility.value = false;
    fetchMeetingList();
  } catch (error) {
    ElMessage.error('会议修改失败');
    console.error('会议修改失败:', error);
  }
};

const formatDate = (dateString: UnwrapRef<MeetingData["startTime"]>) => {
  if (dateString === null) {
    return "无效的日期"; // 或者你想显示的任何默认信息
  }
  return new Date(dateString).toLocaleString();
};

const addRule = {
  name: [{ required: true, message: '请输入会议名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入会议内容', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传会议封面', trigger: 'change' }],
  creator: [{ required: true, message: '请输入创建者', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'blur' }]
};

const handlePreview = (file: any) => {
  console.log('预览文件', file);
};

const handleRemove = (file: any, fileList: any[]) => {
  console.log('移除文件', file, fileList);
};

const handleSuccess = (response: any, file: any, fileList: any[]) => {
  addedMeeting.value.imageUrl = response.url;
  editedMeeting.value.imageUrl = response.url;
};

function extractText(content:any) {
  // 创建一个临时的div元素来解析HTML内容
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // 提取文本内容
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  // 进行内容概括，比如只取前100个字符
  return textContent.length > 100 ? textContent.substring(0, 100) + "..." : textContent;
}


const editorOption = {
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

const isTenantSelectionDisabled = computed(() => currentUser.value.userName !== null);

</script>

<style scoped>
.filter-row {
  margin-bottom: 20px;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
}

.meeting-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}


.button-row {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}

.quill-editor {
  height: 500px;
}

.quill-editor.add-editor .ql-container,
.quill-editor.edit-editor .ql-container {
  height: 450px;
}

.custom-dialog .el-dialog__body {
  padding: 0;
}

.custom-form .el-form-item {
  margin-bottom: 15px;
}

.pagination {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.news-detail {
  font-size: 16px;
  padding: 20px;
  text-align: left;
}
.news-dialog .el-dialog__body {
  text-align: left; /* 确保对话框中的所有文字左对齐 */
}
.meeting-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.meeting-section {
  margin-bottom: 20px;
}

.meeting-content {
  line-height: 1.6;
  margin-top: 10px;
  text-indent: 2em;
}

hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}
</style>
