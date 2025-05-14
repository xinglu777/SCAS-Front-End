<template>
  <div>
    <div class="toolbar">
      <div class="inputName">
        <el-input v-model="searchedPFS" placeholder="请输入模块名称" clearable @input="handleSearchPFS" :prefix-icon="Search" />
      </div>
      <el-button type="primary" icon="Search" @click="handleSearchPFS">查询</el-button>
      <el-button type="warning" plain icon="Sort" @click="filterUnassessed">筛选未评估</el-button>
      <el-button icon="Refresh" @click="handleReset">重置</el-button>
    </div>

    <div class="actions">
      <!-- 文件上传控件用于导入功能结构 -->
      <el-upload
          action="http://localhost:9000/pfs/import"
          accept=".xlsx"
          :before-upload="handleBeforeUpload"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          name="file"
      >
        <el-button type="primary" icon="Upload" style="margin-right: 20px;">导入功能结构</el-button>
      </el-upload>
      <el-button
          type="primary"
          icon="Plus"
          plain
          @click="openAddStructure"
          style="margin-right: 10px;"
      >
        新建功能结构
      </el-button>
      <el-button type="danger" icon="Delete" plain @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>


    <el-table
        ref="structureTable"
        :data="currentPageData"
        style="width: 110%;"
        row-key="id"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="name" label="主结构名称">
        <template #default="{ row }">
    <span class="clickable-structure-name" @click="openViewDialog(row)">
      {{ row.name }}
    </span>
        </template>
      </el-table-column>
<!--      <el-table-column prop="projectDescription" label="所属项目描述"></el-table-column>-->
      <!-- 项目评估状态列（新添加的列，使用项目结构的 description） -->
      <el-table-column label="项目评估状态">
        <template #default="{ row }">
      <span :style="{ color: row.description === '已评估' ? 'green' : 'red' }">
        {{ row.description === '已评估' ? '已评估' : '未评估' }}
      </span>
        </template>
      </el-table-column>
      <!-- 修改后的最后修改时间列 -->
      <el-table-column prop="createdAt" label="开始创建时间">
        <template #default="{ row }">
          <span>{{ formatDate(row.createdAt) }}</span>
        </template>
      </el-table-column>
      <!-- 修改后的最后修改时间列 -->
      <el-table-column prop="updatedAt" label="最后修改时间">
        <template #default="{ row }">
          <span>{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button icon="Edit" link type="primary" @click="openViewStructure(scope.row)">修改</el-button>
          <el-button icon="Delete" link type="danger" @click="handleDeleteRoot(scope.row)">删除</el-button>
          <el-button v-if="scope.row.description !== '已评估'" icon="DataAnalysis" link type="success" @click="openAssess(scope.row)">评估</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
          background
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="确认批量删除" width="30%">
      <span>确定要删除选中的功能结构吗？此操作不可撤销。</span>
      <template v-slot:footer>
        <el-button @click="deleteDialogVisible = false" style="float: left;">取消</el-button>
        <el-button type="danger" @click="confirmBatchDelete">确定</el-button>
      </template>
    </el-dialog>
    <!-- 单个删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="40%">
      <span>确定要删除选中的功能结构吗？此操作不可撤销。</span>
      <template v-slot:footer>
        <el-button @click="deleteDialogVisible = false" style="float: left;">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="View" width="60%" custom-class="custom-dialog" title="查看功能结构">
      <el-form :model="viewOnlyStructure" label-width="100px" label-position="top">
        <!-- 所属项目名称 -->
        <el-form-item>
          <span><strong>所属项目名称：</strong>{{ getProjectName(viewOnlyStructure.projectId) }}</span>
        </el-form-item>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 10px 0;" />
        <!-- 名称 -->
        <el-form-item>
          <span><strong>主结构名称：</strong>{{ viewOnlyStructure.name }}</span>
        </el-form-item>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 10px 0;" />

        <!-- 描述 -->
        <el-form-item>
          <span><strong>项目评估状态：</strong>{{ viewOnlyStructure.description }}</span>
        </el-form-item>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 10px 0;" />

        <!-- 项目结构 -->
        <el-form-item>
          <strong>项目结构：</strong>
        </el-form-item>
        <el-form-item style="margin-top: 0px;">
          <el-tree
              :data="[viewOnlyStructure]"
              :props="treeProps"
              node-key="id"
              highlight-current
              :default-expand-all="true"
              style="margin-top: -45px;margin-left: 70px;"
          >
            <template v-slot="{ node }">
              <div class="tree-node-container" style="display: flex; align-items: center;">
      <span class="node-text">
        {{ node.data.name }}
      </span>
              </div>
            </template>
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="View = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加子结构对话框 -->
    <el-dialog
        v-model="addDialogueVisibility"
        width="60%"
        height="1500px"
        custom-class="custom-dialog"
        :title="dialogTitle"
    >
      <div class="dialog-body">
        <el-form :model="addedPFS" label-width="100px" label-position="top" ref="pfsFormRef">
          <el-form-item label="项目名称" prop="projectId">
            <el-select v-model="addedPFS.projectId" placeholder="请选择项目" style="width: 40%;" @change="handleProjectChange">
              <el-option v-for="project in filteredProjectList" :key="project.id" :label="project.projectName" :value="project.id"></el-option>
            </el-select>
          </el-form-item>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 10px 0;" />
          <!-- 树形结构渲染 -->
          <el-form-item>
            <strong>项目结构：</strong>
          </el-form-item>
          <el-tree
              :data="[addedPFS]"
              :props="treeProps"
              node-key="id"
              highlight-current
              :default-expand-all="true"
              style="margin-top: -45px;margin-left: 70px;"
          >
            <template v-slot="{ node }">
              <div class="tree-node-container" style="display: flex; align-items: center;">
                <!-- 单选框，隐藏 label -->
                <el-radio
                    v-model="selectedNode"
                    :label="node.data.id"
                    @change="handleRadioChange"
                    style="margin-right: 0;"
                >
                  <span style="visibility: hidden;">{{ node.data.id }}</span>
                </el-radio>
                <!-- 根节点和子节点名称均可编辑 -->
                <span
                    v-if="editingNode!== node.data.id"
                    @click="startEditing(node.data)"
                    class="node-text"
                    style="cursor: pointer; margin-left: -35px;"
                >
        {{ node.data.name || '点击进行编辑' }}
      </span>
                <el-input
                    v-else
                    v-model="node.data.name"
                    @blur="finishEditing"
                    @keydown.enter="finishEditing"
                    placeholder="请输入功能结构名称"
                    style="width: 250px; text-align: left; margin-left: -45px;"
                ></el-input>
              </div>
            </template>
          </el-tree>
        </el-form>
      </div>
      <!-- 将按钮放置在对话框的底部 -->
      <template v-slot:footer>
        <div class="dialog-footer-fixed">
          <el-button @click="addDialogueVisibility = false">取消</el-button>
          <div class="right-buttons">
            <el-button type="primary" icon="Plus" @click="addChildStructure">添加子结构</el-button>
            <el-button type="danger" @click="handleDeleteNode">删除选中结构</el-button>
            <el-button type="primary" @click="handleSaveStructure">保存</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 修改结构对话框 -->
    <el-dialog v-model="viewDialogueVisibility" width="60%" custom-class="custom-dialog" title="修改功能结构">
      <el-form :model="selectedStructure" label-width="100px" label-position="top" ref="viewFormRef">
        <el-form-item>
          <strong>项目名称：</strong>{{ getSelectedProjectName(selectedStructure.projectId) }}
        </el-form-item>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 10px 0;" />
        <!-- 项目结构 -->
        <el-form-item>
          <strong>项目结构：</strong>
        </el-form-item>
        <el-form-item style="margin-top: 10px;">
          <el-tree
              :data="[selectedStructure]"
              :props="treeProps"
              node-key="id"
              highlight-current
              :default-expand-all="true"
              style="margin-top: -45px;margin-left: 70px;"
          >
            <template v-slot="{ node }">
              <div class="tree-node-container" style="display: flex; align-items: center;">
                <!-- 单选框，隐藏 label -->
                <el-radio
                    v-model="selectedNode"
                    :label="node.data.id"
                    style="margin-right: 0;"
                >
                  <span style="visibility: hidden;">{{ node.data.id }}</span>
                </el-radio>

                <!-- 根节点和子节点名称均可编辑 -->
                <span
                    v-if="editingNode !== node.data.id"
                    @click="startEditing(node.data)"
                    class="node-text"
                    style="cursor: pointer; margin-left: -35px;"
                >
              {{ node.data.name || '点击进行编辑' }}
            </span>
                <el-input
                    v-else
                    v-model="node.data.name"
                    @blur="finishEditing"
                    @keydown.enter="finishEditing"
                    placeholder="请输入功能结构名称"
                    style="width: 250px; text-align: left; margin-left: -45px;"
                ></el-input>
              </div>
            </template>
          </el-tree>
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <div class="dialog-footer-fixed">
          <el-button @click="viewDialogueVisibility = false">取消</el-button>
          <div class="right-buttons">
            <el-button type="primary" icon="Plus" @click="addChildStructureForEdit">添加子结构</el-button>
            <el-button type="danger" @click="handleDeleteNodeInEditPage">删除选中结构</el-button>
            <el-button type="primary" @click="handleSaveEditedStructure">保存</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue';
import { ElMessage,ElButton, ElTable, ElTableColumn, ElInput, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElRadio } from 'element-plus';
import { Plus, Edit, Delete, Search, Refresh, Sort } from '@element-plus/icons-vue';
import {getRootPFSList, addPFS, updatePFS, deletePFS, getTreeStructure, saveTree, checkProjectIdExists} from '@/api/apiList/pfs';
import {getAllProjects} from "@/api/apiList/project";
import router from "@/router";
import {handleCurrentChange} from "element-plus/es/components/tree/src/model/util";

// 定义 TreeNode 接口类型
interface TreeNode {
  id: string;
  name: string;
  projectId: string;
  parentId?: string;
  description?: string;
  level: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  children?: TreeNode[];
  selected?: boolean;
  projectDescription?: string;
}
const totalItems = computed(() => treeData.value.length); // 计算总数

const treeData = ref<TreeNode[]>([]);
const editingNode = ref<string | null>(null); // 当前处于编辑状态的节点 ID
const treeProps = {
  children: 'children',
  label: 'name',
};

const selectedNode = ref<string>('');
const viewDialogueVisibility = ref<boolean>(false);
const openAssess = (row: TreeNode) => {
  console.log("Row data:", row); // 调试打印
  if (!row.id) {
    console.error("Row does not contain 'id'.");
    return;
  }
  router.push({
    path: '/assess',
    query: { rootId: row.id },
  });
};

// 获取并构建查看页面的数据
const getStructureForView = async (rootId: string): Promise<TreeNode | undefined> => {
  try {
    const response = await getTreeStructure(rootId); // 使用新的接口
    const fullTree = response.data;
    console.log('构建完成的树形结构:', fullTree); // 打印日志以查看构建完成的树形结构
    return fullTree;
  } catch (error) {
    console.error(`未找到 ID 为 ${rootId} 的根节点`, error);
    return undefined;
  }
};
// 分页数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示的条数
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return treeData.value.slice(start, end); // 根据分页数据计算当前页数据
});

// 分页变化事件
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize; // 更新每页条数
  currentPage.value = 1; // 重置为第一页
};

const handleDeleteNodeInEditPage = () => {
  if (!selectedNode.value) {
    alert('请先选中一个功能结构进行删除');
    return;
  }

  if (selectedNode.value === selectedStructure.id) {
    alert('不能删除根节点');
    return;
  }

  // 调用递归函数删除选中节点，只在前端修改树结构
  deleteNodeById(selectedStructure, selectedNode.value);
  console.log('编辑页面节点删除成功:', selectedNode.value);

  // 强制更新 selectedStructure 的 children，确保 Vue 可以检测到变化
  selectedStructure.children = [...(selectedStructure.children || [])];

  // 清空选中的节点
  selectedNode.value = '';
};

// 打开查看功能结构的对话框
const openViewStructure = async (row: TreeNode) => {
  try {
    const fullTree = await getStructureForView(row.id);
    if (fullTree) {
      Object.assign(selectedStructure, fullTree);
      viewDialogueVisibility.value = true; // 打开查看对话框
    }
  } catch (error) {
    console.error('获取完整结构失败:', error);
  }
};
const handleRadioChange = (value:any) => {
  console.log('单选框选中节点ID:', value);
};

const addChildStructureForEdit = () => {
  if (!selectedNode.value) {
    alert('请先选中一个功能结构进行添加子结构');
    return;
  }

  // 递归查找选中的节点
  const targetNode = findNodeById(selectedStructure, selectedNode.value);
  if (!targetNode) {
    alert('无法找到选中的节点');
    return;
  }
  const chinaTime = getCurrentChinaTime();
  // 创建新子结构
  const newChild = {
    id: Date.now().toString(), // 唯一ID
    name: '新子结构',
    projectId: targetNode.projectId,
    parentId: targetNode.id,
    level: (targetNode.level || 0) + 1,
    createdAt: chinaTime, // 使用中国时间
    updatedAt: chinaTime, // 使用中国时间
    children: [],
  };

  if (!targetNode.children) {
    targetNode.children = [];
  }
  targetNode.children.push(newChild);

  console.log('修改页面添加的子结构:', newChild);
};
const addChildStructure = () => {
  let targetNode;

  // 如果选中某个节点，则在该节点下添加子结构
  if (selectedNode.value) {
    targetNode = findNodeById(addedPFS, selectedNode.value);
  } else {
    // 否则在根节点下添加子结构
    targetNode = addedPFS;
  }

  if (!targetNode) {
    console.error('无法找到选中的节点');
    alert('无法找到选中的节点');
    return;
  }

  // 打印选中的目标节点信息，确认是否选中了正确的节点
  console.log('选中的目标节点:', JSON.stringify(targetNode, null, 2));
  const chinaTime = getCurrentChinaTime();
  // 新增子结构，确保其 projectId 与目标节点一致
  const newChild: TreeNode = {
    id: Date.now().toString(), // 使用时间戳作为唯一 ID，但有可能导致短时间内生成相同 ID
    name: '新子结构',
    projectId: targetNode.projectId || addedPFS.projectId, // 确保与目标节点一致的 projectId
    parentId: targetNode.id,
    level: (targetNode.level || 0) + 1,
    createdAt: chinaTime, // 使用中国时间
    updatedAt: chinaTime, // 使用中国时间
    children: [],
  };

  // 使用 Vue 的反应性更新，确保 Vue 能捕捉变化
  if (!targetNode.children) {
    targetNode.children = [];
  }

  // 深拷贝子节点数组，确保 Vue 能捕捉到变化
  targetNode.children = [...targetNode.children, newChild];

  // 打印新添加的子节点信息
  console.log('添加的新子结构:', JSON.stringify(newChild, null, 2));
  console.log('添加后的目标节点:', JSON.stringify(targetNode, null, 2));
  console.log('当前整个树结构:', JSON.stringify(addedPFS, null, 2));
};


interface Project {
  id: string;
  projectName: string;
  description?: string; // 可选属性
}

const projectList = ref<Project[]>([]); // 原始的项目列表
const filteredProjectList = ref<Project[]>([]); // 过滤后的项目列表（只显示没有在 PFS 表中的项目）

// 获取项目列表的方法并进行过滤
const fetchProjectList = async () => {
  try {
    const response = await getAllProjects();
    const allProjects = response.data;
    const availableProjects: Project[] = [];

    // 遍历所有项目并通过 `checkProjectIdExists` 来判断是否存在于 PFS 表中
    for (const project of allProjects) {
      const existsResponse = await checkProjectIdExists(project.id);
      if (!existsResponse.data) {
        // 如果不存在于 PFS 表中，则添加到 availableProjects 列表
        availableProjects.push(project);
      }
    }
    console.log("项目列表:", projectList.value); // 检查项目列表数据是否正确
    filteredProjectList.value = availableProjects; // 赋值给过滤后的项目列表
  } catch (error) {
    console.error("Failed to fetch or filter project list:", error);
  }
};
const deleteDialogVisible = ref<boolean>(false);
const batchDeleteDialogVisible = ref<boolean>(false);
const rootPFSList = ref<TreeNode[]>([]);
const addDialogueVisibility = ref<boolean>(false);
const addedPFS = reactive<TreeNode>({
  id: Date.now().toString(),
  name: '一级结构',
  projectId: '',
  parentId: '',
  description: '',
  level: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  children: [],
  selected: false,
});
const selectedRows = ref<TreeNode[]>([]);
const selectedStructure = reactive<TreeNode>({ id: '', name: '', projectId: '', parentId: '', description: '', level: 0, createdAt: '', updatedAt: '', children: [] });
const editDialogueVisibility = ref<boolean>(false);
const View = ref(false); // 控制查看对话框的显示状态


const searchedPFS = ref<string>('');
const structureTable = ref();
const dialogTitle = ref<string>('添加功能结构');
const currentStructure = reactive<TreeNode>({ id: '', name: '', projectId: '', parentId: '', description: '', level: 0, createdAt: '', updatedAt: '', children: [] });

const handleProjectChange = (projectId: string) => {
  const selectedProject = projectList.value.find(project => project.id === projectId);
  if (selectedProject) {
    addedPFS.name = selectedProject.projectName; // 设置根节点的初始名称为项目名称
  }
};
const viewOnlyStructure = reactive({
  id: '',
  name: '',
  projectId: '',
  description: '',
  level: 0,
  createdAt: '',
  updatedAt: '',
  children: []
});
const openAddStructure = () => {
  dialogTitle.value = '添加功能结构';
  addedPFS.id = Date.now().toString();
  const chinaTime = getCurrentChinaTime();
  addedPFS.name = '';
  addedPFS.projectId = '';
  addedPFS.parentId = '';
  addedPFS.description = '';
  addedPFS.level = 0;
  addedPFS.createdAt = chinaTime; // 使用中国时间
  addedPFS.updatedAt = chinaTime; // 使用中国时间
  addedPFS.children = [];
  addedPFS.selected = false;
  currentStructure.children = [];
  addDialogueVisibility.value = true;
};
const findNodeById = (node: TreeNode, id: string): TreeNode | null => {
  if (node.id === id) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};
// 格式化日期时间的函数
const formatDate = (dateInput:any) => {
  if (!dateInput) return ''; // 如果数据为空，直接返回空字符串

  if (Array.isArray(dateInput)) {
    // 解构数组中的时间信息，设置默认值为 0
    const [year, month, day, hour= 0, minute= 0, second = 0] = dateInput;

    return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日 ` +
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  }


  // 如果是字符串形式，尝试解析为日期对象
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return ''; // 如果无法解析为有效日期，返回空字符串

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};

const handleSaveEditedStructure = async () => {
  console.log('开始保存修改后的功能结构...', selectedStructure);
  try {
    // 删除原有的树
    await deletePFS(selectedStructure.id);
    console.log(`原有的功能结构根节点（ID：${selectedStructure.id}）已删除`);

    // 确保所有节点的项目ID保持一致
    const rootProjectId = selectedStructure.projectId;
    const chinaTime = getCurrentChinaTime();
    const propagateProjectId = (node: TreeNode) => {
      node.projectId = selectedStructure.projectId; // 确保所有节点的项目ID一致

      // 如果节点原来有 createdAt，则保留它；否则初始化为当前时间
      node.createdAt = node.createdAt ? node.createdAt : new Date().toISOString();

      // 设置 updatedAt 为当前时间
      node.updatedAt = chinaTime;
      node.description = node.description === '已评估' ? '已评估' : '未评估';

      // 重新生成唯一 ID，确保每个节点的 ID 都唯一
      node.id = Date.now().toString();

      // 等待 1 毫秒以确保 ID 不同
      setTimeout(() => {
        if (node.children && node.children.length > 0) {
          node.children.forEach((child: TreeNode) => propagateProjectId(child));
        }
      }, 1);
    };
    propagateProjectId(selectedStructure); // 执行项目ID一致化和重新生成ID

    // 调用后端API保存整个树
    const response = await saveTree(selectedStructure);
    console.log('功能结构保存成功:', response);
    ElMessage.success('修改保存成功');
    viewDialogueVisibility.value = false; // 关闭对话框
    fetchRootPFSList(); // 刷新根结构列表
  } catch (error) {
    console.error('保存修改后的功能结构时出错:', error);
    ElMessage.error('修改保存失败');
  }
};

const saveNodeAndChildren = async (node: TreeNode, parentId: string | null = null) => {
  try {
    // 更新节点的父节点 ID
    if (parentId) {
      node.parentId = parentId;
    }

    // 调用保存接口，保存当前节点
    const response = await addPFS(node);
    if (response?.data?.id) {
      console.log('节点保存成功，ID：', response.data.id);
      node.id = response.data.id; // 更新节点的 ID 为从后端返回的 ID

      // 如果有子节点，递归保存子节点
      if (node.children && node.children.length > 0) {
        for (let child of node.children) {
          if (node.id) { // 确保 node.id 存在
            await saveNodeAndChildren(child, node.id); // 递归调用保存子节点
          }
        }
      }
    } else {
      throw new Error('节点保存失败');
    }
  } catch (error) {
    console.error('保存节点时出错:', error);
    throw error; // 如果保存失败，抛出错误以便上层函数处理
  }
};


const handleSaveStructure = async () => {
  console.log('开始保存结构...', JSON.stringify(addedPFS, null, 2));

  try {
    // 递归打印树中的所有节点，调试用
    const printAllNodes = (node: TreeNode, depth= 0): void => {
      console.log(`${' '.repeat(depth * 2)}节点ID: ${node.id}, 节点名称: ${node.name}`);
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: TreeNode) => printAllNodes(child, depth + 1));
      }
    };

    printAllNodes(addedPFS);

    // 递归保存整个树结构
    await saveNodeAndChildren(addedPFS);

    addDialogueVisibility.value = false; // 关闭对话框
    ElMessage.success('新建成功');
    fetchProjectList();
    fetchRootPFSList();
  } catch (error) {
    console.error('保存结构时出错：', error);
    ElMessage.error('新建失败，请重试');
  }
};

const handleDeleteRoot = (row: TreeNode) => {
  selectedNode.value = row.id;
  deleteDialogVisible.value = true; // 打开确认对话框
};

const confirmDelete = () => {
  if (selectedNode.value) {
    deletePFS(selectedNode.value).then(() => {
      fetchRootPFSList();
      deleteDialogVisible.value = false; // 关闭对话框
      ElMessage.success('删除成功');
      fetchProjectList();
    }).catch((error:any) => {
      console.error('Failed to delete root structure:', error);
      ElMessage.error('删除失败，请重试');
    });
  }
};
// 批量删除操作
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    alert('请先选择要删除的功能结构');
    return;
  }
  batchDeleteDialogVisible.value = true; // 打开批量删除确认对话框
};

// 确认批量删除
const confirmBatchDelete = () => {
  selectedRows.value.forEach((node) => {
    console.log('准备删除节点：', node);
    deletePFS(node.id)
        .then(() => {
          console.log(`节点 ${node.id} 删除成功`);
          fetchRootPFSList(); // 重新获取数据以更新界面

        })
        .catch((error) => {
          console.error('删除节点失败：', error);
          ElMessage.error('批量删除失败，请重试');
        });
  });
  batchDeleteDialogVisible.value = false; // 关闭对话框
  fetchProjectList();
  ElMessage.success('删除成功');
};


const handleReset = () => {
  searchedPFS.value = '';
  fetchRootPFSList();
  currentPage.value = 1;
};
const handleSearchPFS = () => {
  if (searchedPFS.value) {
    treeData.value = rootPFSList.value.filter(item =>
        item.name.includes(searchedPFS.value)
    );
  } else {
    fetchRootPFSList();
  }
  currentPage.value = 1; // 搜索后重置为第一页
};

const filterUnassessed = () => {
  treeData.value = rootPFSList.value.filter(item => item.description === '未评估');
  currentPage.value = 1; // 筛选后重置为第一页
};

const handleSelectionChange = (val: TreeNode[]) => {
  console.log("Selection Change Triggered"); // 确认该函数被调用
  selectedRows.value = val;
  console.log("当前选中的节点:", selectedRows.value); // 确认选中的值
};

const getSelectedProjectName = (projectId: string) => {
  // 在项目列表中查找对应的项目名称
  const project = projectList.value.find(project => project.id === projectId);
  return project ? project.projectName : '未知项目';
};


const handleDeleteNode = () => {
  if (!selectedNode.value) {
    alert('请先选中一个功能结构进行删除');
    return;
  }

  if (selectedNode.value === addedPFS.id) {
    alert('不能删除根节点');
    return;
  }

  // 调用递归函数删除选中节点
  deleteNodeById(addedPFS, selectedNode.value);
  console.log('节点删除成功:', selectedNode.value);

  // 清空选中的节点
  selectedNode.value = '';
};
// 开始编辑节点
const startEditing = (node: TreeNode) => {
  editingNode.value = node.id; // 设置为编辑状态
};
const getCurrentChinaTime = () => {
  const date = new Date();
  const options = { timeZone: 'Asia/Shanghai', hour12: false };
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    ...options,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatter.formatToParts(date);
  // 使用 Map<string, string> 来存储各个日期部分
  const dateParts: Record<string, string> = parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {} as Record<string, string>);

  // 将日期组合成 ISO 8601 格式
  const year = dateParts.year;
  const month = dateParts.month;
  const day = dateParts.day;
  const hour = dateParts.hour;
  const minute = dateParts.minute;
  const second = dateParts.second;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};
const getProjectName = (projectId: string) => {
  const project = projectList.value.find(project => project.id === projectId);
  return project ? project.projectName : '未知项目';
};

// 完成编辑节点
const finishEditing = () => {
  editingNode.value = null; // 退出编辑状态
};
// 递归查找并删除节点函数
const deleteNodeById = (parentNode: TreeNode, id: string) => {
  if (!parentNode.children) return;

  // 查找目标节点的索引
  const index = parentNode.children.findIndex(child => child.id === id);
  if (index !== -1) {
    // 删除目标节点
    parentNode.children.splice(index, 1);
    return;
  }

  // 递归删除子节点中的目标节点
  parentNode.children.forEach(child => {
    deleteNodeById(child, id);
  });
};


// 上传前处理，验证文件类型和大小
const handleBeforeUpload = (file: File) => {
  const isXlsx = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (!isXlsx) {
    ElMessage.error('只能上传 Excel (.xlsx) 文件');
    return false;
  }
  return true;
};
// 打开查看功能结构的对话框
const openViewDialog = async (row: TreeNode) => {
  try {
    const fullTree = await getStructureForView(row.id);
    if (fullTree) {
      // 深拷贝数据到 viewOnlyStructure
      Object.assign(viewOnlyStructure, fullTree);

      console.log('完整的功能结构:', viewOnlyStructure); // 日志打印查看完整数据

      View.value = true; // 打开查看对话框
    } else {
      console.error("未获取到完整的功能结构树");
    }
  } catch (error) {
    console.error('获取完整结构失败:', error);
  }
};


// 上传成功的回调
const handleImportSuccess = async (response: any) => {
  console.log("导入成功:", response);
  ElMessage.success('导入成功！');
  try {
    await fetchProjectList();
    await fetchRootPFSList(); // 立刻获取最新的功能结构列表
    ElMessage.success('功能结构列表刷新成功');
  } catch (error) {
    console.error("刷新功能结构列表时出错:", error);
    ElMessage.error('刷新功能结构列表失败');
  }
};

// 上传失败的回调
const handleImportError = (error:any) => {
  console.error('导入失败:', error);
  ElMessage.error('导入失败，请重试或检查文件格式是否正确。');
};
// 获取功能结构列表的方法
const fetchRootPFSList = async () => {
  try {
    const response = await getRootPFSList();
    let pfsList = response.data;

    // 遍历功能结构列表，添加项目描述到新的字段
    pfsList.forEach((pfs: TreeNode) => {
      const project = projectList.value.find(proj => proj.id === pfs.projectId);
      if (project) {
        pfs.projectDescription = project.description || "无描述"; // 使用新的字段来存储项目的描述信息
      } else {
        console.warn(`未找到匹配的项目 ID：${pfs.projectId}`);
        pfs.projectDescription = "无描述"; // 如果找不到匹配项目，设置为默认值
      }
    });
    pfsList = pfsList.sort((a: TreeNode, b: TreeNode) => {
      // 解析 updatedAt 数组为日期对象
      const parseDate = (dateInput: string | Date | number[]) => {
        if (Array.isArray(dateInput)) {
          // 如果是数组类型，解析为 Date
          const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
          return new Date(year, month - 1, day, hour, minute, second); // 月份减 1
        } else if (typeof dateInput === 'string' || dateInput instanceof Date) {
          // 如果是字符串或 Date 对象，直接转换为 Date
          return new Date(dateInput);
        } else {
          throw new Error('Invalid date input format');
        }
      };

      const dateA = parseDate(a.updatedAt!); // 使用 "!" 表示 updatedAt 不为空
      const dateB = parseDate(b.updatedAt!);

      return dateB.getTime() - dateA.getTime(); // 按降序排序
    });

    // 更新表格数据
    rootPFSList.value = pfsList;
    treeData.value = pfsList;

  } catch (error) {
    console.error('Failed to fetch root PFS list:', error);
  }
};

const fetchProjectList1 = async () => {
  try {
    const response = await getAllProjects();
    projectList.value = response.data;

    console.log("项目列表:", projectList.value); // 检查项目列表数据是否正确
  } catch (error) {
    console.error("Failed to fetch project list:", error);
  }
};


onMounted(async () => {
  try {
    await fetchProjectList1(); // 确保项目数据先加载完成
    await fetchProjectList();
    await fetchRootPFSList(); // 加载功能结构列表
  } catch (error) {
    console.error("初始化时出错:", error);
  }
});
</script>


<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 180px;
}
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.inputName {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.actions {
  margin-bottom: 20px;
  display: flex;
}

.dialog-footer-fixed {
  position: sticky; /* 让按钮区域始终粘附在底部 */
  bottom: 0;
  background-color: white; /* 确保背景色和对话框一致 */
  padding: 10px 20px;
  display: flex;
  justify-content: space-between; /* 取消按钮在左，其他按钮在右 */
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  z-index: 1; /* 确保按钮在最上层，避免被内容遮挡 */
}

.clickable-structure-name {
  cursor: pointer;
  color: #409eff; /* 蓝色，表示可点击 */
  text-decoration: underline;
}
.evaluated {
  color: green;
}

.not-evaluated {
  color: red;
}

.right-buttons {
  display: flex;
  gap: 10px;
}

</style>