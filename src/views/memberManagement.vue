<template>
  <div>
    <!-- 搜索和过滤栏 -->
    <el-row :gutter="20" class="filter-row">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="openAddDialog">
          <el-icon style="margin-right: 5px;"><Plus /></el-icon> 新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain @click="batchDelete" :disabled="selectedRows.length === 0">
          <el-icon style="margin-right: 5px;"><Delete /></el-icon> 批量删除
        </el-button>
      </el-col>
      <el-col :span="4">
        <el-form-item label="成员名称">
          <el-input v-model="searData.name" placeholder="请输入成员名称" />
        </el-form-item>
      </el-col>
      <el-col :span="4">
        <el-form-item label="状态">
          <el-select
              v-model="searData.state"
              placeholder="请选择状态"
          >
            <!-- 全部，value=null，表示不传值 -->
            <el-option label="全部" :value="null"></el-option>
            <!-- 正常，value=1 -->
            <el-option label="正常" :value="1"></el-option>
            <!-- 禁用，value=0 -->
            <el-option label="禁用" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" @click="seaData">
          <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleReset">
          <el-icon style="margin-right: 5px;"><Refresh /></el-icon> 重置
        </el-button>
      </el-col>
    </el-row>

    <!-- 详情弹窗 -->
    <el-dialog title="成员详情" v-model="detailDialogVisible" width="40%" class="member-detail-dialog">
      <div class="dialog-user-info">
        <!-- 头像部分 -->
        <el-image :src="detailMember.avatar" fit="cover" class="detail-dialog-avatar" />
        <!-- 用户详细信息部分 -->
        <div class="dialog-user-details">
          <div class="dialog-user-text"><strong>用户名:</strong> {{ detailMember.username }}</div>
          <div class="dialog-user-text"><strong>手机号:</strong> {{ detailMember.phone }}</div>
          <div class="dialog-user-text"><strong>密码:</strong> {{ detailMember.password }}</div>
          <div class="dialog-user-text"><strong>状态:</strong> {{ detailMember.state === 1 ? '正常' : '禁用' }}</div>
          <div class="dialog-user-text"><strong>角色:</strong> {{ roleName }}</div>
          <div class="dialog-user-text"><strong>邮箱:</strong> {{ detailMember.email }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 新增成员弹窗 -->
    <el-dialog title="新增成员" v-model="addDialogVisible" width="45%" @close="resetAddForm">
      <el-form :model="newMember" ref="newMemberForm" label-width="80px">
        <el-form-item label="用户名" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="newMember.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="newMember.password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="邮箱" :rules="[{ required: true, message: '请输入邮箱', trigger: 'blur' }]">
          <el-input v-model="newMember.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话" :rules="[{ required: true, message: '请输入电话号码', trigger: 'blur' }]">
          <el-input v-model="newMember.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="角色" :rules="[{ required: true, message: '请选择角色', trigger: 'blur' }]">
          <el-select
              v-model="selectedRole"
              placeholder="请选择角色"
              @change="handleRoleChange"
          >
            <el-option label="评估师" value="评估师"></el-option>
            <el-option label="审核员" value="审核员"></el-option>
            <el-option label="评估师和审核员" value="评估师和审核员"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
          <el-upload
              action="#"
              :http-request="handleHttpRequest"
              :on-change="handleUploadAvatar"
              :on-remove="handleAvatarRemove"
              list-type="picture-card"
              :file-list="avatar"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAdd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改成员弹窗 -->
    <el-dialog title="修改成员" v-model="editDialogVisible" width="45%" @close="resetEditForm">
      <el-form :model="editedMember" ref="editedMemberForm" label-width="80px">
        <el-form-item label="用户名" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="editedMember.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="editedMember.password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="邮箱" :rules="[{ required: true, message: '请输入邮箱', trigger: 'blur' }]">
          <el-input v-model="editedMember.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话" :rules="[{ required: true, message: '请输入电话号码', trigger: 'blur' }]">
          <el-input v-model="editedMember.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="角色" :rules="[{ required: true, message: '请选择角色', trigger: 'blur' }]">
          <el-select
              v-model="selectedRole"
              placeholder="请选择角色"
              @change="editRoleChange"
          >
            <el-option label="评估师" value="评估师"></el-option>
            <el-option label="审核员" value="审核员"></el-option>
            <el-option label="评估师和审核员" value="评估师和审核员"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
          <el-upload
              action="#"
              :http-request="handleHttpRequest"
              :on-change="handleUploadAvatarE"
              :on-remove="handleAvatarRemoveE"
              :file-list="avatar"
              list-type="picture-card"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEdit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 成员表格 -->
    <el-table :data="pagedUserList" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" label="选择" align="center"/>
      <el-table-column label="成员信息" align="center">
        <template #default="scope">
          <div class="member-info">
            <img :src="scope.row.avatar" alt="头像" class="avatar"/>
            <span class="member-name">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" align="center">
        <template #default="scope">
          <span
              :class="{
              'role-assessor': scope.row.examine === 1 && scope.row.assess !== 1,
              'role-reviewer': scope.row.assess === 1 && scope.row.examine !== 1,
              'role-both': scope.row.examine === 1 && scope.row.assess === 1
            }"
          >
            <!-- 根据逻辑显示角色名称 -->
            {{ scope.row.examine === 1 && scope.row.assess === 1
              ? '评估师和审核员'
              : scope.row.examine === 1
                  ? '审核员'
                  : scope.row.assess === 1
                      ? '评估师'
                      : '无角色' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template v-slot="scope">
          <el-switch
              v-model="scope.row.state"
              :active-value="1"
              :inactive-value="2"
              active-text="正常"
              inactive-text="禁用"
              @change="toggleStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="电话号码" align="center"/>
      <el-table-column fixed="right" label="操作" align="center">
        <template v-slot="scope">
          <el-button link type="primary" size="small" @click="openEditFromTable(scope.row, '修改成员')" style="margin: 0 5px">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 修改
          </el-button>
          <el-button link type="primary" size="small" style="color: #e10000; margin: 0 5px" @click="handleDelete(scope.row)">
            <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
          </el-button>
          <el-button link type="info" size="small" @click="viewDetails(scope.row)">
            <el-icon style="margin-right: 5px;"><Document /></el-icon> 详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, Refresh, Document } from '@element-plus/icons-vue';
import {memberList, memberUpdate, memberAdd, searchMember, memberDelete, memberDeleteOne} from '@/api/apiList/member';
import {uploadAvatar} from "@/api/apiList/member";

export default defineComponent({
  name: 'MemberManagement',
  components: {
    Search,
    Plus,
    Edit,
    Delete,
    Refresh,
    Document
  },
  setup() {

    interface Member {
      assess: number;
      examine: number;
      state: number;
      status: number;
      tenantId: number;
      userId: number;
      avatar: string;
      email: string;
      password: string;
      phone: string;
      username: string;
    }

    const detailDialogVisible = ref(false);  // 控制详情弹窗的显示
    const detailMember = ref<Member>({} as Member);  // 存储详情数据
    const roleName = ref(''); // 存储角色名称

    // 处理详情按钮点击事件
    const viewDetails = (row: any) => {
      detailMember.value = { ...row }; // 将成员数据填充到 detailMember 中
      // 根据 assess 和 examine 设置角色名称
      roleName.value = row.assess === 1 && row.examine === 1 ? '评估师和审核员' :
          row.assess === 1 && row.examine === 0 ? '评估师' :
              row.examine === 1 && row.assess === 0? '审核员' : '无角色';

      detailDialogVisible.value = true;  // 打开详情弹窗
    };

    const handleEdit = async () => {
      try {
        let response: any = await memberUpdate(editedMember.value); // 调用更新接口
        if (response.code === 1000) {
          ElMessage.success('修改成功');
          // 修改成功后从表格中更新数据
          userList.value = userList.value.map(user =>
              user.userId === editedMember.value.userId ? { ...editedMember.value } : user
          );
          editDialogVisible.value = false; // 关闭弹窗
          getTableData();
          total.value = userList.value.length; // 更新总数
        } else {
          ElMessage.error(`修改失败: ${response.message}`);
        }
      } catch (error) {
        ElMessage.error('修改失败，请稍后再试');
      }
    };

    const openEditFromTable = (row: any, title: string) => {
      console.log(row.userId);
      dialogTitle.value = title;
      editedMember.value = { ...row }; // 填充选中行的数据到 `editedMember`
      console.log(editedMember.value.userId);
      selectedRole.value = row.assess === 1 && row.examine === 1 ? '评估师和审核员' :
          row.assess === 1 && row.examine === 0? '评估师' :
              row.examine === 1 && row.assess === 0? '审核员' : ''; // 根据 assess 和 examine 字段设置角色
      editDialogVisible.value = true; // 打开弹窗
      avatar.value = editedMember.value.avatar ? [{name:editedMember.value.avatar, url:editedMember.value.avatar}] : [];
      console.log(avatar);
    };

    const editDialogVisible = ref(false); // 控制修改弹窗的显示
    const editedMember = ref<Member>({} as Member); // 用于存储编辑的数据

    const batchDelete = async () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的成员');
        return;
      }

      const userIds = selectedRows.value.map((row: any) => row.userId); // 获取选中成员的 ID
      try {
        // 调用删除接口
        let response: any = await memberDelete(userIds); // 假设你有批量删除的接口
        if (response.code === 1000) {
          ElMessage.success('删除成功');
          // 从列表中移除已删除的成员
          userList.value = userList.value.filter((user: any) => !userIds.includes(user.userId));
          selectedRows.value = []; // 清空选中状态
          total.value = userList.value.length;
        } else {
          ElMessage.error(`删除失败: ${response.message}`);
        }
      } catch (error) {
        ElMessage.error('删除失败，请稍后再试');
      }
    };

    const selectedRows = ref([]); // 存储选中的行

    const handleSelectionChange = (val: any) => {
      selectedRows.value = val; // 更新选中的行
    };

    const selectedRole = ref(''); // 用于存储选择的角色值

// 监听角色变化的函数
    const handleRoleChange = (value: string) => {
      selectedRole.value = value;
      if (value === '评估师') {
        newMember.value.assess = 1;
        newMember.value.examine = 0;
      } else if (value === '审核员') {
        newMember.value.assess = 0;
        newMember.value.examine = 1;
      } else if (value === '评估师和审核员') {
        newMember.value.assess = 1;
        newMember.value.examine = 1;
      }
    };

    // 监听修改角色变化的函数
    const editRoleChange = (value: string) => {
      selectedRole.value = value;
      if (value === '评估师') {
        editedMember.value.assess = 1;
        editedMember.value.examine = 0;
      } else if (value === '审核员') {
        editedMember.value.assess = 0;
        editedMember.value.examine = 1;
      } else if (value === '评估师和审核员') {
        editedMember.value.assess = 1;
        editedMember.value.examine = 1;
      }
    };

    const addDialogVisible = ref(false); // 控制新增成员弹窗的显示
    const openAddDialog = () => {
      addDialogVisible.value = true; // 显示新增成员弹窗
    };


    const handleAdd = async () => {
      newMember.value.state = 1;
      newMember.value.tenantId = JSON.parse(localStorage.getItem('userInfo') || '{}').tenantId;
      try {
        let info: any = await memberAdd(newMember.value);
        if (info.code === 1000) {
          ElMessage.success('新增成员成功');
          // 将新增成员插入到 userList 的第一行
          userList.value.unshift({ ...newMember.value });
          addDialogVisible.value = false; // 关闭弹窗
          avatar.value =[];
          getTableData();
          resetAddForm(); // 重置表单
        } else {
          ElMessage.error('新增成员失败');
        }
      } catch (error) {
        ElMessage.error('新增成员失败');
      }
    };

    const resetAddForm = () => {
      newMember.value.phone = '';
      newMember.value.username = '';
      newMember.value.avatar = '';
      newMember.value.assess = 0;
      newMember.value.examine = 0;
      newMember.value.email = '';
      newMember.value.password = '';
      selectedRole.value = ''
      console.log(avatar.value)
      avatar.value = [];
      console.log(avatar.value)
    };

    const resetEditForm = () => {
      editedMember.value.username = '';
      editedMember.value.avatar = '';
      editedMember.value.assess = 0;
      editedMember.value.examine = 0;
      editedMember.value.email = '';
      editedMember.value.password = '';
      editedMember.value.phone = '';
      selectedRole.value = '';
      avatar.value = [];
    };

    const newMember = ref<Member>({} as Member);
    const searchData = ref({
      name: '',
      role: '',
      status: '',
      tenantId: JSON.parse(localStorage.getItem('userInfo') || '{}').tenantId, // 这里可以根据实际情况设置租户ID
    });

    const searData = ref({
      name: '',
      state: null as number | null, // 允许 state 为 number 或 null
      tenantId: JSON.parse(localStorage.getItem('userInfo') || '{}').tenantId, // 这里可以根据实际情况设置租户ID
    });

    // 所有成员数据
    const userList = ref<any[]>([]);

    // 分页相关状态
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    // 计算分页后的数据
    const pagedUserList = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return userList.value.slice(start, end);
    });

    const dialogShow = ref(false);
    const dialogTitle = ref('');
    const dialogData = ref({
      name: '',
      avatar: '',
      role: ''
    });

    // 获取用户数据
    const getTableData = async () => {
      try {
        let info: any = await memberList({ tenantId: searchData.value.tenantId });
        if (info && info.code === 1000) {
          userList.value = info.data;
          total.value = userList.value.length;
        } else {
          ElMessage.error(`获取表格数据失败: ${info.message}`);
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('获取表格数据失败');
      }
    };

    const seaData = async () => {
      try {
        // 构建用于查询的参数
        const queryParams = {
          tenantId: searData.value.tenantId,
          username: searData.value.name,
          state: searData.value.state,
        };
        console.log(queryParams)
        // 调用搜索接口
        const response: any = await searchMember(queryParams);

        if (response && response.code === 1000) {
          userList.value = response.data; // 更新表格数据
          total.value = response.data.length; // 更新总数
        } else {
          ElMessage.error(`获取数据失败: ${response.message}`);
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('获取表格数据失败，请稍后重试');
      }
    };

    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage;
    };

    const handlePageSizeChange = (newSize: number) => {
      pageSize.value = newSize;
      currentPage.value = 1; // 更改每页条数时重置到第一页
    };

    const handleReset = () => {
      searchData.value = {
        name: '',
        role: '',
        status: '',
        tenantId: 1,
      };
      getTableData();
    };

    const handleDelete = async (row: any) => {
      console.log(row.userId)
      const userId = row.userId;  // 获取当前行的 userId
      console.log(row.userId)
      try {
        // 调用删除接口
        console.log("userid",userId)
        const response: any = await memberDeleteOne(userId);
        if (response.code === 1000) {
          ElMessage.success('删除成功');
          // 删除成功后从列表中移除该成员
          userList.value = userList.value.filter((user: any) => user.userId !== userId);
          total.value = userList.value.length;  // 更新总数
        } else {
          ElMessage.error(`删除失败: ${response.message}`);
        }
      } catch (error) {
        ElMessage.error('删除失败，请稍后重试');
      }
    };

    const toggleStatus = async (row: any) => {
      // 切换状态
      editedMember.value = { ...row };
      console.log(editedMember.value)
      let response: any = await memberUpdate(editedMember.value);
      if (response.code === 1000) {
        ""
      }else{
        ElMessage.error('状态更新失败');
      }
    }

    //放一下修改的成员的头像
    const avatar = ref<Array<{ name: string; url: string }>>([]);

    const handleAvatarSuccess = () => {
      ""
    }

    const beforeAvatarUpload = () => {
      ""
    }

    const handleHttpRequest = () => {
      return Promise.resolve();
    };

    const handleAvatarRemove = (file: any) => {
      console.log("删除图片：", file);
      newMember.value.avatar = ""; // 清除图片 URL
      ElMessage.success("图片已删除！");
    }

    const handleAvatarRemoveE = (file: any) => {
      console.log("删除图片：", file);
      editedMember.value.avatar = ""; // 清除图片 URL
      ElMessage.success("图片已删除！");
    }

    const handleUploadAvatar = (file: any) => {
      const originalFileName = file.raw.name;
      const timestamp = Date.now();
      const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
      const newFileName = `${originalFileName.split('.')[0]}_${timestamp}${fileExtension}`;
      const newFile = new File([file.raw], newFileName, { type: file.type });
      uploadAvatar(newFile,0)
          .then(response => {
            if (response && response.data){
              newMember.value.avatar = response.data;
              console.log(newMember.value.avatar);
            } else{
              console.error("上传失败");
              ElMessage.error("上传失败");
            }
          })
    };

    const handleUploadAvatarE = (file: any) => {
      const originalFileName = file.raw.name;
      const timestamp = Date.now();
      const fileExtension = originalFileName.substring(originalFileName.lastIndexOf('.'));
      const newFileName = `${originalFileName.split('.')[0]}_${timestamp}${fileExtension}`;
      const newFile = new File([file.raw], newFileName, { type: file.type });
      uploadAvatar(newFile,editedMember.value.userId)
          .then(response => {
            if (response && response.data){
              editedMember.value.avatar = response.data;
              console.log(editedMember.value.avatar);
            } else{
              console.error("上传失败");
              ElMessage.error("上传失败");
            }
          })
    };


    onMounted(() => {
      getTableData();
    });

    return {
      searchData,
      userList,
      pagedUserList,
      currentPage,
      pageSize,
      total,
      dialogData,
      dialogShow,
      dialogTitle,
      selectedRows,
      getTableData,
      handleReset,
      handleSelectionChange,
      openEditFromTable,
      handleDelete,
      viewDetails,
      toggleStatus,
      handlePageChange,
      handlePageSizeChange,
      addDialogVisible,
      newMember,
      openAddDialog,
      handleAdd,
      resetAddForm,
      handleAvatarSuccess,
      beforeAvatarUpload,
      handleRoleChange,
      selectedRole,
      seaData,
      searData,
      batchDelete,
      editDialogVisible,
      editedMember,
      resetEditForm,
      handleEdit,
      editRoleChange,
      detailDialogVisible,
      detailMember,
      roleName,
      handleHttpRequest,
      handleUploadAvatar,
      handleUploadAvatarE,
      handleAvatarRemove,
      handleAvatarRemoveE,
      avatar,
    };
  }
});
</script>

<style scoped>
.filter-row, .button-row {
  margin-bottom: 20px;
}
.dialog-footer {
  text-align: right;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 控制头像和名称的容器对齐 */
.member-info {
  display: flex;
  align-items: center;  /* 控制头像在垂直方向的对齐方式，可以改为 flex-start 或 flex-end 来调整位置 */
  justify-content: flex-start; /* 控制头像在水平方向的对齐方式 */
  margin-bottom: 5px; /* 控制头像和其他元素之间的间距 */
}

/* 控制头像大小和位置 */
.avatar {
  width: 40px;  /* 头像大小 */
  height: 40px; /* 头像大小 */
  border-radius: 50%; /* 圆形头像 */
  margin-right: 10px; /* 头像和名称之间的水平间距 */
  margin-top: 0px; /* 控制头像在垂直方向上的上移或下移，可以调整这个值 */
  margin-left: 80px;  /* 控制头像在水平方向上的左移或右移，可以调整这个值 */
  /* 通过调整margin来微调头像的位置 */
}

.member-name {
  font-size: 16px;
  font-weight: bold;
}

/* 角色样式保持不变 */
.role-assessor {
  color: orange;
  font-weight: bold;
}

.role-reviewer {
  color: brown;
  font-weight: bold;
}

.role-both {
  color: #666666;
  font-weight: bold;
}

/* 详情对话框的样式，确保与其他对话框独立 */
.member-detail-dialog {
  width: 40%;  /* 设置适合的宽度 */
}

/* 对话框容器 */
.dialog-user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* 头像样式，独立于其他对话框的头像 */
.detail-dialog-avatar {
  width: 180px;  /* 调整头像大小 */
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

/* 用户详细信息的容器 */
.dialog-user-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 40%;  /* 限制详情文本区域宽度 */
  padding-left: 50px; /* 让文本不靠左 */
}

/* 每一行的文本样式 */
.dialog-user-text {
  font-size: 14px;
  margin-bottom: 10px;
  text-align: left; /* 让每一行文本左对齐 */
}

/* 强调标签部分 */
.dialog-user-text strong {
  font-weight: bold;
  color: #333;
}

/* 对话框按钮区域的样式 */
.dialog-footer {
  text-align: right;
}


</style>
