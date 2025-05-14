<template>
  <div>
    <h1>功能点计算</h1>

    <el-row :gutter="20">
      <!-- 左侧：根节点信息和树形结构 -->
      <el-col :span="12">
        <div class="function-structure-container">
          <!-- 根节点信息 -->
          <div v-if="rootNode" class="root-info">
            <div class="info-item"><strong>名称：</strong>{{ rootNode.name }}</div>
            <el-divider></el-divider>
            <div class="info-item"><strong>描述：</strong>{{ rootNode.description || "无描述" }}</div>
            <el-divider></el-divider>
            <div class="info-item"><strong>项目编号：</strong>{{ rootNode.projectId }}</div>
          </div>

          <el-divider></el-divider>
          <!-- 树形结构 -->
          <el-tree
              :data="treeData"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              default-expand-all
              style="height: 100%; overflow-y: auto;">
          </el-tree>
        </div>

        <el-divider></el-divider>
        <div><strong>项目GSC系统特征DI值</strong></div>
<!--        <el-divider></el-divider>-->
        <div style="width: auto; height: 440px;" id="echarts4">
          <!-- 插入echarts4图表组件 -->
          <echarts4 :gsc-data="gscData" :gsc-labels="gscLabels"></echarts4>
        </div>

      </el-col>

      <!-- 右侧：输入表单 -->
      <el-col :span="12">
        <div class="center-container">
        <el-form :model="inputData" label-width="160px">

          <!-- GSC 权值评分 -->
          <h2>GSC 权值评分</h2>
          <!-- 功能根节点：文本框 -->
          <el-form-item label="功能根节点">
            <el-input v-model="rootNodeName" placeholder="功能根节点" readonly></el-input>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12" v-for="(value, key) in gscData" :key="key">
              <el-form-item :label="gscLabels[key]">
                <el-input-number v-model="gscData[key]" :min="0" :max="5" :disabled="!canPerformProjectOperations"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row justify="center" style="margin-top: 0px;margin-bottom: 10px;">
            <el-button type="primary" @click="evaluateGSC" :disabled="!canPerformProjectOperations" style="margin-right: 10px;">
              自动评估
            </el-button>
          </el-row>
          <!-- VAF 和调整后的功能点 -->
          <el-form-item label="VAF (调整系数)">
            <el-input v-model="vaf" placeholder="VAF 将在这里显示" readonly></el-input>
          </el-form-item>

          <el-form-item label="已调整功能点数 (DFP)">
            <el-input v-model="adjustedFunctionPoints" placeholder="已调整功能点数将在这里显示" readonly></el-input>
          </el-form-item>

          <!-- 项目调整后的功能点 -->
          <el-row justify="center" style="margin-top: 10px;">
            <el-button type="primary" @click="calculateVAF" :disabled="!canPerformProjectOperations" style="margin-right: 10px;">计算项目VAF值</el-button>
            <el-button type="primary" @click="calculateAdjustedPoints" :disabled="!canPerformProjectOperations" style="margin-right: 10px;">计算项目已调整功能点数</el-button>
          </el-row>
          <el-divider></el-divider>

          <!-- 规模变更调整因子法 -->
          <h2>规模变更调整因子法</h2>
          <el-form-item label="规模变更调整因子 (CF)">
            <el-select v-model="selectedCF" placeholder="请选择调整因子">
              <el-option label="2.00 - 项目立项" value="2.00"></el-option>
              <el-option label="1.50 - 项目招标" value="1.50"></el-option>
              <el-option label="1.26 - 项目早期" value="1.26"></el-option>
              <el-option label="1.26 - 项目中期" value="1.26"></el-option>
              <el-option label="1.00 - 项目完成" value="1.00"></el-option>
            </el-select>
          </el-form-item>
          <!-- S  -->
          <el-form-item label="项目S值">
            <el-input v-model="projectS" placeholder="项目S值将在这里显示" readonly></el-input>
          </el-form-item>

          <!-- 项目调整后的功能点 -->
          <el-row justify="center" style="margin-top: 10px;">
            <el-button type="primary" @click="calculateS" :disabled="!canPerformProjectOperations" style="margin-right: 10px;">计算项目S值</el-button>
          </el-row>
          <el-divider></el-divider>
          <el-row justify="center" style="margin-top: 10px;">
          <el-button type="primary" @click="saveRootResult" :disabled="!canPerformProjectOperations">保存项目评估结果</el-button>
          <el-button type="primary" @click="returnToProjectList" >返回项目列表</el-button>
          </el-row>
        </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import echarts4 from "@/views/echarts4.vue"; // 确保 import 在顶部

export default defineComponent({
  name: 'FunctionPointCalculator',
  components: {echarts4,},
  setup() {

    const selectedCF = ref(''); // 初始值为空字符串

    const route = useRoute(); // 获取当前路由信息
    const rootId = route.query.rootId; // 从路由中获取根节点ID
    const projectUFP = ref(route.query.projectUFP ? Number(route.query.projectUFP as string) : null); // 转为数字或 null
    console.log('接收到的根节点ID:', rootId); // 输出根节点ID

    const calculateS = () => {
      if (!projectUFP.value || !selectedCF.value) {
        ElMessage.error('请确保已输入未调整功能点 (UFP) 和选择调整因子 (CF)');
        return;
      }
      const ufp = projectUFP.value;
      const cf = parseFloat(selectedCF.value);
      if (isNaN(ufp) || isNaN(cf)) {
        ElMessage.error('UFP 或 CF 格式无效');
        return;
      }
      const sValue = (ufp * cf).toFixed(2); // 计算 S 值并保留两位小数
      projectS.value = sValue; // 将计算结果显示在项目 S 值的文本框中
      ElMessage.success(`项目 S 值计算成功: ${sValue}`);
    };

    const returnToProjectList = () => {
      router.push({
        path: '/try', // 跳转到项目列表页面（将路径改为实际需要的路径）
      });
    };

    // 根节点名称
    const rootNodeName = ref(''); // 保存后端返回的根节点名称

    //从后端获取根节点名字
    console.log("前端获取到的 rootId:", rootId);
    const fetchRootNodeData = async () => {
      try {
        console.log("发送数据");
        const response = await axios.post("http://localhost:9000/api/sub-functions/getRootId", { rootId });
        console.log("后端返回的根节点数据:", response.data);
        // 提取并设置根节点名称
        rootNodeName.value = response.data.rootName || '未知根节点';
      } catch (error) {
        console.error("获取根节点数据失败:", error);
      }
    };onMounted(() => {
      fetchRootNodeData();
    });

    // 根节点数据
    const rootNode = ref(null); // 用于存储根节点信息
    // 获取根节点信息
    const fetchRootNode = async () => {
      try {
        const response = await axios.post("http://localhost:9000/api/sub-functions/getRoot", { rootId });
        rootNode.value = response.data; // 存储根节点信息
        console.log("获取到的根节点信息:", rootNode.value);
      } catch (error) {
        console.error("获取根节点信息失败:", error);
      }
    };
    // 页面加载时，获取根节点和树形数据
    onMounted(() => {
      fetchRootNode(); // 获取根节点信息
      fetchTreeData(); // 获取树形结构数据
    });

    const evaluateGSC = async () => {
      try {
        // 调用后端接口进行 GSC 评估
        const response = await axios.post("http://localhost:8000/api/autoEvaluateGSC", {
          rootName: rootNodeName.value, // 根节点名称
        });

        // 检查返回的数据是否为数组
        if (response.data && Array.isArray(response.data)) {
          const numbers = response.data;

          // 定义 GSC 键的顺序（与后端返回的数字顺序一致）
          const gscKeys = [
            "dataCommunication",
            "distributedDataProcessing",
            "performance",
            "heavilyUsedConfiguration",
            "transactionRate",
            "onlineDataEntry",
            "endUserEfficiency",
            "onlineUpdate",
            "complexProcessing",
            "reusability",
            "installationEase",
            "operationalEase",
            "multipleSites",
            "facilitateChange",
          ];

          // 检查返回的数组长度是否匹配键数量
          if (numbers.length === gscKeys.length) {
            // 映射数字到 GSC 键
            gscKeys.forEach((key, index) => {
              gscData.value[key as keyof typeof gscData.value] = numbers[index];
            });

            // 成功提示
            ElMessage({
              message: "GSC 数据评估完成！",
              type: "success",
            });
          } else {
            throw new Error("返回的数字数量与 GSC 键数量不匹配");
          }
        } else {
          throw new Error("后端返回的数据格式不正确");
        }
      } catch (error) {
        console.error("GSC 数据评估失败:", error);

        // 错误提示
        ElMessage({
          message: "GSC 数据评估失败，请重试！",
          type: "error",
        });
      }
    };

    //从后端获取根节点所有最子节点列表
    const fetchLeafNodes = async() => {
      try {
        console.log("发送数据，获得最子节点");
        const response = await axios.post("http://localhost:9000/api/sub-functions/getLeafNodes", { rootId });
        console.log("后端返回的最子节点数据:", response.data);
        //提取子节点列表
        subFunctions.value = response.data.leafNodes.map((node: { id: number; name: string  }) => ({
          id: node.id,
          name: node.name,
          isCompleted: false, // 默认值为未完成
        }));
        // 检查完成状态
        updateCanPerformProjectOperations();
      } catch (error) {
        console.error("获取最子节点数据失败:", error);
      }
    };onMounted(async () => {
      fetchLeafNodes();
    });

    //根据rootId从后端获取所有层级孩子节点，形成树结构，用于在左侧展示
    const treeData = ref([]); // 用于存储树形结构数据
    const fetchTreeData = async () => {
      try {
        const response = await axios.post('http://localhost:9000/api/sub-functions/getTree', { rootId });
        treeData.value = response.data; // 保存树形结构数据
        console.log('获取到的树结构:', treeData.value);
      } catch (error) {
        console.error('获取树形结构数据失败:', error);
      }
    };onMounted(() => {
      fetchTreeData(); // 初始化时获取树数据
    });

    const inputData = ref({
      ufp: '', // 未调整功能点数量
      ILF: '',
      EIF: '',
      EI: '',
      EO: '',
      EQ: '',
      ILFComplexity: '',
      EIFComplexity: '',
      EIComplexity: '',
      EOComplexity: '',
      EQComplexity: ''
    });

    const gscData = ref({
      dataCommunication: 0,
      distributedDataProcessing: 0,
      performance: 0,
      heavilyUsedConfiguration: 0,
      transactionRate: 0,
      onlineDataEntry: 0,
      endUserEfficiency: 0,
      onlineUpdate: 0,
      complexProcessing: 0,
      reusability: 0,
      installationEase: 0,
      operationalEase: 0,
      multipleSites: 0,
      facilitateChange: 0,
    });

    const gscLabels = {
      dataCommunication: '数据通信',
      distributedDataProcessing: '分布式数据处理',
      performance: '性能',
      heavilyUsedConfiguration: '频繁使用的配置',
      transactionRate: '事务速率',
      onlineDataEntry: '在线数据输入',
      endUserEfficiency: '终端用户效率',
      onlineUpdate: '在线更新',
      complexProcessing: '复杂处理',
      reusability: '可复用性',
      installationEase: '易安装性',
      operationalEase: '操作易用性',
      multipleSites: '多站点',
      facilitateChange: '易于更改',
    };

    const result = ref(''); // 未调整功能点数结果
    const vaf = ref(''); // VAF 结果
    const adjustedFunctionPoints = ref(''); // 已调整功能点数结果
    const projectS = ref('');//项目S值
    const projects = ref([]); // 项目列表
    const subFunctions = ref<{ id: number; name: string ; isCompleted: boolean}[]>([]); // 子功能列表
    const selectedRoot = ref(rootId); // 当前选择的项目
    const selectedSubFunction = ref<number | null>(null); // 当前选择的子功能ID
    const canPerformProjectOperations = ref(false); // 是否可以进行项目操作

    // 计算未调整功能点数
    const submitData = async () => {
      const dataToSend = {
        ilf: Number(inputData.value.ILF),
        eif: Number(inputData.value.EIF),
        ei: Number(inputData.value.EI),
        eo: Number(inputData.value.EO),
        eq: Number(inputData.value.EQ),
        complexities: [
          inputData.value.ILFComplexity,
          inputData.value.EIFComplexity,
          inputData.value.EIComplexity,
          inputData.value.EOComplexity,
          inputData.value.EQComplexity,
        ],
      };
      try {
        const response = await axios.post('http://localhost:9000/api/sub-functions/calculate', dataToSend);
        result.value = response.data; // Assuming the backend returns unadjusted function points directly
        inputData.value.ufp = result.value; // Update unadjusted function points
      } catch (error) {
        console.error('Error calculating unadjusted function points:', error);
      }
    };

    //将子功能计算信息和未调整功能点结果传递给后端，保存
    const saveSubFunctionResult = async () => {
      const subFunctionData = {
        subFunctionId: selectedSubFunction.value,
        subFunctionName: subFunctions.value.find(sub => sub.id === selectedSubFunction.value)?.name || '',
        rootId: rootId,
        rootNodeName: rootNodeName.value,
        ilf: inputData.value.ILF,
        eif: inputData.value.EIF,
        ei: inputData.value.EI,
        eo: inputData.value.EO,
        eq: inputData.value.EQ,
        complexities: [
          inputData.value.ILFComplexity,
          inputData.value.EIFComplexity,
          inputData.value.EIComplexity,
          inputData.value.EOComplexity,
          inputData.value.EQComplexity,
        ],
        ufp: inputData.value.ufp,
      };

      try {
        console.log("提交的子功能计算信息及结果数据: ", subFunctionData);
        const response = await axios.post('http://localhost:9000/api/sub-functions/saveSubfunctionResult', subFunctionData);
        console.log('保存成功:', response.data);
        updateCanPerformProjectOperations();
        // 提示用户保存成功
        ElMessage({
          message: '保存成功！',
          type: 'success',
        });

        // 清空输入框数据
        inputData.value = {
          ufp: '',
          ILF: '',
          EIF: '',
          EI: '',
          EO: '',
          EQ: '',
          ILFComplexity: '',
          EIFComplexity: '',
          EIComplexity: '',
          EOComplexity: '',
          EQComplexity: '',
        };
        result.value = '';
        // vaf.value = '';
        adjustedFunctionPoints.value = '';
        selectedSubFunction.value = null;
        console.log('清空所有输入框成功');

      } catch (error) {
        console.error('保存子功能未调整功能点数失败:', error);
        // 提示用户保存失败
        ElMessage({
          message: '保存失败，请重试！',
          type: 'error',
        });
      }
    };

    // 更新子功能完成状态
    const updateCanPerformProjectOperations = async () => {
      try {
        const response = await axios.post("http://localhost:9000/api/sub-functions/checkCompletionStatus", {
          subFunctionIds: subFunctions.value.map((sub) => sub.id),
        });

        // 定义返回的数据结构类型
        const completionStatuses: { id: number; isCompleted: boolean }[] = response.data;

        subFunctions.value = subFunctions.value.map((sub) => ({
          ...sub,
          isCompleted: completionStatuses.find((status) => status.id === sub.id)?.isCompleted || false,
        }));

        // 检查所有子功能是否完成
        canPerformProjectOperations.value = subFunctions.value.every((sub) => sub.isCompleted);
      } catch (error) {
        console.error("更新子功能完成状态失败:", error);
      }
    };onMounted(async () => {
      await fetchLeafNodes();
      await updateCanPerformProjectOperations();
    });

    // 计算VAF (值调整因子)
    const calculateVAF = () => {
      const isGSCComplete = Object.values(gscData.value).every(val => val !== 0);
      if (!isGSCComplete) {
        ElMessage.error('请补全项目GSC评估信息');
        return;
      }
      const diSum = Object.values(gscData.value).reduce((acc, val) => acc + val, 0);
      vaf.value = (diSum * 0.01 + 0.65).toFixed(2); // VAF calculation formula
    };

    // 计算调整功能点
    const calculateAdjustedPoints = () => {
      const isGSCComplete = Object.values(gscData.value).every(val => val !== 0);
      if (!isGSCComplete) {
        ElMessage.error('请补全项目GSC评估信息');
        return;
      }

      if (!projectUFP.value || !vaf.value) {
        ElMessage.error('请先计算未调整功能点数和VAF值');
        return;
      }
      if (!projectUFP.value || !vaf.value) {
        console.error('Unadjusted function points or VAF not calculated yet');
        return;
      }
      adjustedFunctionPoints.value = (Number(projectUFP.value) * parseFloat(vaf.value)).toFixed(2); // DFP计算公式
    };

    const router = useRouter(); // 引入 Vue Router 对象
    const saveRootResult = async () => {

      const isGSCComplete = Object.values(gscData.value).every(val => val !== 0);
      if (!isGSCComplete) {
        ElMessage.error('请补全项目评估信息');
        return;
      }

      if (!selectedCF.value) {
        ElMessage.error('请补全项目评估信息');
        return;
      }

      if (!vaf.value || !adjustedFunctionPoints.value || !projectS.value) {
        ElMessage.error('请补全项目评估信息');
        return;
      }
      // 准备发送到后端的数据
      const rootResultData = {
        rootId: rootId, // 根节点 ID
        rootName: rootNodeName.value, // 根节点名称
        vaf: parseFloat(vaf.value), // VAF 值调整系数
        adjustedFunctionPoints: parseFloat(adjustedFunctionPoints.value), // 已调整功能点数
        // projectUFP: parseFloat(projectUFP.value), // 项目未调整功能点数
        projectUFP: projectUFP.value !== null ? projectUFP.value : 0, // 如果为 null，使用默认值 0
        projectS: parseFloat(projectS.value), // 项目 S 值
      };

      try {
        console.log("当前 VAF 值:", vaf.value);
        console.log("提交项目评估数据到后端:", rootResultData);
        console.log("当前 S 值:",projectS .value);
        // 调用后端接口，提交数据
        const response = await axios.post(
            "http://localhost:9000/api/sub-functions/saveRootResult",
            rootResultData
        );

        console.log("项目评估结果保存成功:", response.data);

        console.log("准备调用第二个接口 changeRootDescription");
        console.log("根节点 ID:", rootId);
        // 调用接口修改根节点描述
        const changeDescriptionResponse = await axios.post(
            `http://localhost:9000/api/sub-functions/changeRootDescription?id=${rootId}`
        );
        console.log("根节点描述更新成功:", changeDescriptionResponse.data);

        // 成功提示
        ElMessage({
          message: "项目评估结果保存成功！",
          type: "success",
        });

        // 跳转到 /try 页面
        router.push({ path: '/try' });
        router.push({
          path: '/try',
          query: {
            rootId: rootId, // 传递 rootId
            adjustedFunctionPoints: adjustedFunctionPoints.value, // 传递已调整功能点数
          },
        });
      } catch (error) {
        console.error("项目评估结果保存失败:", error);

        // 失败提示
        ElMessage({
          message: "项目评估结果保存失败，请重试！",
          type: "error",
        });
      }
    };

    return {
      evaluateGSC,
      treeData,
      rootNode,
      rootNodeName,
      inputData,
      gscData,
      gscLabels,
      result,
      vaf,
      adjustedFunctionPoints,
      projects,
      subFunctions,
      canPerformProjectOperations,
      fetchLeafNodes,
      selectedRoot,
      selectedSubFunction,
      projectUFP,
      submitData,
      calculateVAF,
      calculateAdjustedPoints,
      saveSubFunctionResult,
      saveRootResult,
      returnToProjectList,
      selectedCF,
      calculateS,
      projectS,
    };
  }
});
</script>

<style scoped>
.el-tree {
  margin-left: 75px;
  transform: scale(1.2);
  background-color: #f9f9f9; /* 背景颜色 */
  padding: 20px; /* 增加内边距以扩大视觉空间 */
  border-radius: 20px; /* 保持圆角效果 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 增加阴影，突出效果 */
  max-height: 800px; /* 增加高度限制 */
  overflow-y: auto; /* 保持垂直滚动 */
  max-width: 100%; /* 设置最大宽度 */
  width: 700px; /* 增加宽度 */
}

.function-structure-container {
  background-color: #f9f9f9;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.inline-input-group {
  display: flex;
  align-items: center;
}

.inline-input-group > * {
  margin-right: 10px;
}

.root-info {
  text-align: left; /* 确保内容左对齐 */
  background-color: #ffffff; /* 可选：白色背景 */
  padding: 10px; /* 添加内边距 */
  border-radius: 8px; /* 可选：圆角效果 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 可选：阴影效果 */
}

.info-item {
  margin-bottom: 5px; /* 每个项目之间增加间距 */
}
h1 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 20px;
}
.center-container {
  display: flex;
  flex-direction: column;
  height: 93%;
  padding: 30px;
  background: #F5F6F8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>