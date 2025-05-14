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
        <el-form-item label="租户名称">
          <el-input v-model="searchName" placeholder="请输入租户名称" />
        </el-form-item>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" @click="searchData">
          <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleReset">
          <el-icon style="margin-right: 5px;"><Refresh /></el-icon> 重置
        </el-button>
      </el-col>
    </el-row>

    <!-- 成员表格 -->
    <el-table :data="tenantListPaged" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" label="选择" align="center"/>
      <el-table-column label="租户信息" align="center">
        <template #default="scope">
          <div class="member-info">
            <span class="member-name">{{ scope.row.tenantName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="电话号码" align="center"/>
      <el-table-column prop="email" label="邮箱" align="center"/>
      <el-table-column fixed="right" label="操作" align="center">
        <template v-slot="scope">
          <el-button link type="primary" size="small" @click="openEditFromTable(scope.row)" style="margin: 0 5px">
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

    <el-dialog :model-value="dialogVisible" ref="formRef" @update:model-value="value => dialogVisible = value" :title="dialogTitle" width="40%">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="85px" label-position="right">
        <el-form-item prop="tenantName" label="租户名称">
          <el-input v-model="form.tenantName" placeholder="请输入租户名称"></el-input>
        </el-form-item>
        <el-form-item prop="phone" label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item v-if="dialogTitle ==='修改租户'" prop="password" label="密码">
          <el-input v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

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

import {Delete, Plus, Refresh, Search} from "@element-plus/icons-vue";
import {defineComponent, onMounted, ref, computed} from "vue";
import {add, deleteBatch, deleteById, getAllTenants, searchTenants, update} from "@/api/apiList/tenant";
import {ElMessage, ElForm, FormRules, ElMessageBox} from "element-plus";
import router from "@/router";


export default defineComponent({
  name: 'TenantManagement',
  components: {
    Search,
    Plus,
    Delete,
    Refresh,
  },
  setup(){

    interface Tenant {
      tenantId : string;
      tenantName : string;
      password?: string;
      phone: string;
      email: string;
    }

    const tenantList =  ref<Tenant[]>([]);
    const searchName = ref<string>('');
    const selectedRows = ref([]);

    //分页
    const currentPage = ref(1);
    const pageSize = ref(10);

    const dialogVisible = ref(false);
    const formRef = ref<InstanceType<typeof ElForm> | null>(null);
    const dialogTitle = ref<string>();

    //const tabs = ref<Tab[]>([]);

    const form = ref<Tenant>({
      tenantId: '',
      tenantName:'',
      password:'',
      phone:'',
      email:''
    })
    interface Tab {
      name: string;
      label: string;
      path: string;
      fixed?: boolean; // 新增固定标签的属性，表示是否为固定标签
    }

    //获取租户列表
    const fetchTenantList = async() => {
      getAllTenants()
          .then(response => {
              if(response && response.data){
                tenantList.value = response.data;
                console.log("返回租户列表："+tenantList.value);
              }else {
                console.log("返回租户列表失败");
              }
          });
    }

    // 计算分页后的数据
    const tenantListPaged = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return tenantList.value.slice(start, end);
    });

    const total = computed(() => {
      return tenantList.value.length;
    })

    //处理分页
    const handlePageChange = (newPage: number) => {
      currentPage.value = newPage;
    };

    //处理页面显示条数变化
    const handlePageSizeChange = (newSize: number) => {
      pageSize.value = newSize;
      currentPage.value = 1; // 更改每页条数时重置到第一页
    };

    //打开新增成员弹窗
    const openAddDialog = () => {
      dialogTitle.value = '新增租户';
      dialogVisible.value = true; // 显示新增成员弹窗
    };

    const rules = ref<FormRules>({
      tenantName:[{required:true,message:'请输入租户名称',trigger:'blur'}],
      phone: [
        {required:true,pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur'},
      ],
      email: [
        {type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur'},
      ],
      password:[{required:true,message:'请输入租户名称',trigger:'blur'}]
    })

    //选择行变化时
    const handleSelectionChange = (val: any) => {
      selectedRows.value = val; // 更新选中的行
    };

    //批量删除
    const batchDelete = async () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的租户');
        return;
      }
      const tenantIds = selectedRows.value.map((row: any) => row.tenantId); // 获取选中成员的 ID
      // 调用删除接口
      ElMessageBox.confirm(
          '此操作将永久删除租户，是否继续？',
          '提示',
          {
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type:'warning'
          }
      ).then(async()=>{
        try {
          deleteBatch(tenantIds)
              .then(response => {
                if (response && response.data){
                  selectedRows.value = [] //清空选中的行
                  fetchTenantList();
                }else{
                  console.log("批量删除租户失败");
                }
              })
        }catch (error){
          ElMessage.error('请求出错');
        }
      }).catch(()=>{
        ElMessage.info('已取消删除')
      });
    };

    //搜索
    const searchData = async () => {
      searchTenants(searchName.value)
          .then(response => {
            if(response && response.data){
              tenantList.value = response.data;
              console.log("查找成功！" + tenantList.value);
            }else{
              console.log("查找失败！");
            }
          })
    }

    //打开修改租户
    const openEditFromTable = (row: any) => {
      form.value = { ...row }; // 填充选中行的数据到
      dialogVisible.value = true; // 打开弹窗
      dialogTitle.value = "修改租户";
    };

    //删除租户
    const handleDelete = async (row: any) => {
      console.log(row.tenantId)
      const tenantId = row.tenantId;  // 获取当前行的 tenantId
      ElMessageBox.confirm(
          '此操作将永久删除该租户，是否继续？',
          '提示',
          {
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type:'warning'
          }
      ).then(async()=>{
        try {
          console.log(tenantId);
          deleteById(tenantId)
              .then(response => {
                if(response && response.data){
                  fetchTenantList();
                  console.log("删除租户成功！");
                }else{
                  console.log("删除租户失败！");
                }
              })
        }catch (error){
          ElMessage.error('请求出错');
        }
      }).catch(()=>{
        ElMessage.info('已取消删除')
      });
    };

    // 处理详情按钮点击事件
    const viewDetails = (row: any) => {
      const tenantId = row.tenantId;
      localStorage.setItem('tenantId', tenantId);

      router.push({ path: `/ManagerMember`});
    };

    //取消
    const handleCancel = () =>{
      dialogVisible.value = false;
    }

    //提交表单
    const submitForm = async() => {
      formRef.value?.validate(async (valid:boolean) =>{
        if(valid){

          if("新增租户" === dialogTitle.value){
            form.value.password = form.value.phone;
            add(form.value)
                .then(response => {
                  if(response && response.data){
                    form.value.tenantName = "";
                    form.value.phone = "";
                    form.value.password = "";
                    form.value.email = "";
                    form.value.tenantId = "";
                    dialogVisible.value = false;
                    ElMessage.success('添加租户成功');
                    fetchTenantList();
                  }else{
                    console.log("添加失败！");
                  }
                })
          }else {
            update(form.value)
                .then(response => {
                  if(response && response.data){
                    dialogVisible.value = false;
                    console.log("修改成功！");
                    fetchTenantList();
                  }else{
                    console.log("修改失败！");
                  }
                })
          }
        }
      })

    }

    const handleReset = () => {
      fetchTenantList()
    }



    onMounted(() => {
      console.log("获取租户列表！");
      fetchTenantList();
    });

    return{
      tenantList,
      tenantListPaged,
      searchName,
      dialogVisible,
      rules,
      form,
      formRef,
      dialogTitle,
      selectedRows,
      currentPage,
      pageSize,
      total,
      openAddDialog,
      handleSelectionChange,
      batchDelete,
      searchData,
      openEditFromTable,
      handleDelete,
      viewDetails,
      submitForm,
      handleCancel,
      handleReset,
      handlePageChange,
      handlePageSizeChange,

    };
  }
})


</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

</style>