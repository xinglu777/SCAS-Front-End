<template>
  <div>
    <h1>这是界面一</h1>
  </div>
  <!-- 用户表格 -->
  <el-table :data="tableData" style="width: 100%">
    <el-table-column type="selection" label="选择" align="center"/>
    <el-table-column prop="number" label="序号" align="center" width="70"/>
    <el-table-column prop="name" label="课程名称" align="center">
    </el-table-column>
    <el-table-column prop="introduction" label="课程简介" align="center"/>
    <el-table-column label="审核状态" align="center">
      <template v-slot="scope">
        <span v-if="scope.row.type === '0'" style="color: red">未审核</span>
        <span v-else-if="scope.row.type === '1'" style="color: green">审核通过</span>
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" align="center"></el-table-column>
  </el-table>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {ChangeData, SearchData, TableData} from "@/types/CourseTypes";
import {ElMessage} from "element-plus";
import {coursePage} from "@/api/apiList/course";
export default defineComponent({
  name: 'CourseComponent',
  setup() {
    const tableData = ref<TableData[]>([]);
    const total = ref(0);
    const searchData = ref<SearchData>({
      name: '',
      pageIndex: 1,
      pageSize: 10,
      number: '',
      type: ''
    });
    const changeData = ref<ChangeData>({
      cgname: '',
      cgcover: '',
      cgintroduction: '',
      cgnumber: null,
      cgvideo: [],
      cgauthor: '',
    });
    const videoString = ref('');
    const getTableData = async (val?: boolean) => {
      if (val === true) {
        searchData.value.pageIndex = 1;
      }
      try {
        let info: any = await coursePage(searchData.value); // 从 AxiosResponse 中提取数据
        if (info.code === 1000) {
          tableData.value = info.data;
          total.value = info.total;
          //清除changeData
          changeData.value.cgname = "";
          changeData.value.cgcover = "";
          changeData.value.cgintroduction = "";
          changeData.value.cgnumber = null;
          changeData.value.cgvideo = [];
          changeData.value.cgauthor = "";
          videoString.value = "";
        } else {
          ElMessage.error(`获取表格数据失败: ${info.message}`);
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('获取表格数据失败');
      }
    };

    onMounted(() => {
      getTableData(false);
    });

    return {
      tableData,
      getTableData,
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
</style>
