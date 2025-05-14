<template>
  <div>
    <h1>功能点评估</h1>

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

        <div><strong>功能分析雷达图</strong></div>
        <div style="width: auto; height: 500px;" id="echarts3">
          <!-- 插入echarts3图表组件 -->
          <echarts3 :savedSubFunctionResults="savedSubFunctionResults"></echarts3>
        </div>

      </el-col>

      <!-- 右侧：输入表单 -->
      <el-col :span="12">
        <div class="center-container">
          <div><strong>功能点计算</strong></div>
          <el-form :model="inputData" label-width="160px">
            <!-- 功能根节点：文本框 -->
            <div class="inline-input-group">
            <el-form-item label="功能根节点">
              <el-input v-model="rootNodeName" placeholder="功能根节点" readonly></el-input>
            </el-form-item>
            </div>
            <el-form-item label="选择子功能">
              <el-select v-model="selectedSubFunction" placeholder="请选择子功能" :disabled="!subFunctions.length">
                <el-option
                    v-for="subFunction in subFunctions"
                    :key="subFunction.id"
                    :label="subFunction.name"
                    :value="subFunction.id"
                    :disabled="subFunction.isCompleted">
                  {{ subFunction.name }}
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="功能类型数量及复杂度">
              <!-- 功能类型输入框和复杂度选择（每行放一组） -->
              <el-row :gutter="10" class="aligned-input-row">
                <el-col :span="24">
                  <el-form-item>
                    <div class="inline-input-group">
                      <label class="input-label">ILF：</label>
                      <el-input v-model="inputData.ILF" placeholder="ILF" style="width: 120px;"></el-input>
                      <el-select
                          v-model="inputData.ILFComplexity"
                          placeholder="复杂度"
                          style="width: 120px; margin-left: 10px;"
                      >
                        <el-option label="高" value="高"></el-option>
                        <el-option label="中" value="中"></el-option>
                        <el-option label="低" value="低"></el-option>
                      </el-select>
                      <label class="input-label">EIF：</label>
                      <el-input
                          v-model="inputData.EIF"
                          placeholder="EIF"
                          style="width: 120px; margin-left: 10px;"
                      ></el-input>
                      <el-select
                          v-model="inputData.EIFComplexity"
                          placeholder="复杂度"
                          style="width: 120px; margin-left: 10px;"
                      >
                        <el-option label="高" value="高"></el-option>
                        <el-option label="中" value="中"></el-option>
                        <el-option label="低" value="低"></el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="10" class="aligned-input-row">
                <el-col :span="24">
                  <el-form-item>
                    <div class="inline-input-group">
                      <label class="input-label">EI：</label>
                      <el-input v-model="inputData.EI" placeholder="EI" style="width: 120px;"></el-input>
                      <el-select
                          v-model="inputData.EIComplexity"
                          placeholder="复杂度"
                          style="width: 120px; margin-left: 10px;"
                      >
                        <el-option label="高" value="高"></el-option>
                        <el-option label="中" value="中"></el-option>
                        <el-option label="低" value="低"></el-option>
                      </el-select>
                      <label class="input-label">EO：</label>
                      <el-input
                          v-model="inputData.EO"
                          placeholder="EO"
                          style="width: 120px; margin-left: 10px;"
                      ></el-input>
                      <el-select
                          v-model="inputData.EOComplexity"
                          placeholder="复杂度"
                          style="width: 120px; margin-left: 10px;"
                      >
                        <el-option label="高" value="高"></el-option>
                        <el-option label="中" value="中"></el-option>
                        <el-option label="低" value="低"></el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="10" class="aligned-input-row">
                <el-col :span="24">
                  <el-form-item>
                    <div class="inline-input-group">
                      <label class="input-label">EQ：</label>
                      <el-input v-model="inputData.EQ" placeholder="EQ" style="width: 120px;"></el-input>
                      <el-select
                          v-model="inputData.EQComplexity"
                          placeholder="复杂度"
                          style="width: 120px; margin-left: 10px;"
                      >
                        <el-option label="高" value="高"></el-option>
                        <el-option label="中" value="中"></el-option>
                        <el-option label="低" value="低"></el-option>
                      </el-select>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form-item>
            <!-- 自动评估按钮 -->
            <el-row justify="center" style="margin-top: -30px;margin-bottom: 10px;">
              <el-row justify="center" style="margin-top: 0px;">
                <el-button type="primary" @click="selectedSubFunction !== null && autoEvaluate(selectedSubFunction)">自动评估</el-button>
              </el-row>

            </el-row>
            <!-- 未调整功能点部分 -->
            <el-form-item label="子功能功能点数量">
              <el-input v-model="result" placeholder="未调整功能点数将在这里显示" readonly style="text-align: center;"></el-input>
            </el-form-item>

            <el-row justify="center">
              <el-button type="primary" @click="submitData" >计算未调整功能点数</el-button>
              <el-button type="primary" @click="saveSubFunctionResult" >保存子功能未调整功能点数</el-button>
            </el-row>

            <el-row justify="center" style="margin-top: 20px;">
              <div v-for="(result, index) in savedSubFunctionResults" :key="index" class="saved-result">
                <p><strong>保存记录 {{ index + 1 }}：</strong></p>
                <ul>
                  <li><strong>子功能名称：</strong>{{ result.subFunctionName }}</li>
                  <li>
                    <strong>ILF：</strong>{{ result.ilf }}
                    <span v-if="result.ilfComplexity">（复杂度：{{ result.ilfComplexity }}）</span>
                  </li>
                  <li>
                    <strong>EIF：</strong>{{ result.eif }}
                    <span v-if="result.eifComplexity">（复杂度：{{ result.eifComplexity }}）</span>
                  </li>
                  <li>
                    <strong>EI：</strong>{{ result.ei }}
                    <span v-if="result.eiComplexity">（复杂度：{{ result.eiComplexity }}）</span>
                  </li>
                  <li>
                    <strong>EO：</strong>{{ result.eo }}
                    <span v-if="result.eoComplexity">（复杂度：{{ result.eoComplexity }}）</span>
                  </li>
                  <li>
                    <strong>EQ：</strong>{{ result.eq }}
                    <span v-if="result.eqComplexity">（复杂度：{{ result.eqComplexity }}）</span>
                  </li>
                  <li><strong>未调整功能点数：</strong>{{ result.ufp }}</li>
                </ul>
                <el-divider></el-divider>
              </div>
            </el-row>

            <el-form-item label="项目UFP">
              <el-input v-model="projectUFP" placeholder="项目未调整功能点数将在这里显示" :disabled="!canPerformProjectOperations"  readonly style="text-align: center;"></el-input>
            </el-form-item>

            <el-row justify="center">
              <el-button type="primary" @click="calculateProjectUnadjustedPoints" :disabled="!canPerformProjectOperations" >计算项目未调整功能点数</el-button>
              <el-button type="primary" @click="navigateToAssess2" :disabled="!canPerformProjectOperations">调整项目功能点数</el-button>
            </el-row>
            <el-divider></el-divider>
            <el-button type="primary" @click="returnToProjectList" >返回项目列表</el-button>

          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">

import echarts3 from './echarts3.vue'; // 确保路径正确，根据实际项目结构调整
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus'; // 确保 import 在顶部

export default defineComponent({
  name: 'FunctionPointCalculator',
  components: {
    echarts3, // 注册组件
  },
  setup() {

    const route = useRoute(); // 获取当前路由信息

    const returnToProjectList = () => {
      router.push({
        path: '/try', // 跳转到项目列表页面（将路径改为实际需要的路径）
      });
    };

    const rootId = route.query.rootId; // 从路由中获取根节点ID
    console.log('接收到的根节点ID:', rootId); // 输出根节点ID
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
    });

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
        // renderMindMap(treeData.value); // 渲染思维导图
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
    const projects = ref([]); // 项目列表
    const subFunctions = ref<{ id: number; name: string ; isCompleted: boolean}[]>([]); // 子功能列表
    const selectedRoot = ref(rootId); // 当前选择的项目
    const selectedSubFunction = ref<number | null>(null); // 当前选择的子功能ID
    const canPerformProjectOperations = ref(false); // 是否可以进行项目操作

    const validateInputs = () => {
      // 定义允许的复杂度值
      const allowedComplexities = ['高', '中', '低'];

      // 检查是否是非负整数的正则表达式
      const isNonNegativeInteger = (value: string): boolean => /^\d+$/.test(value);

      // 检查子功能是否已选择
      if (!selectedSubFunction.value) {
        ElMessage({
          message: '请选择评估的子功能',
          type: 'warning',
        });
        return false; // 输入不合法
      }

      // 检查功能数量和复杂度是否为空
      if (
          !inputData.value.ILF || !inputData.value.ILFComplexity ||
          !inputData.value.EIF || !inputData.value.EIFComplexity ||
          !inputData.value.EI || !inputData.value.EIComplexity ||
          !inputData.value.EO || !inputData.value.EOComplexity ||
          !inputData.value.EQ || !inputData.value.EQComplexity
      ) {
        ElMessage({
          message: '请完善评估信息输入',
          type: 'warning',
        });
        return false; // 输入不合法
      }

      // 检查功能数量是否为非负整数
      if (
          !isNonNegativeInteger(inputData.value.ILF) ||
          !isNonNegativeInteger(inputData.value.EIF) ||
          !isNonNegativeInteger(inputData.value.EI) ||
          !isNonNegativeInteger(inputData.value.EO) ||
          !isNonNegativeInteger(inputData.value.EQ)
      ) {
        ElMessage({
          message: '功能数量不合法，请确保输入为非负整数',
          type: 'warning',
        });
        return false; // 输入不合法
      }

      // 检查复杂度是否为“高”“中”“低”
      if (
          !allowedComplexities.includes(inputData.value.ILFComplexity) ||
          !allowedComplexities.includes(inputData.value.EIFComplexity) ||
          !allowedComplexities.includes(inputData.value.EIComplexity) ||
          !allowedComplexities.includes(inputData.value.EOComplexity) ||
          !allowedComplexities.includes(inputData.value.EQComplexity)
      ) {
        ElMessage({
          message: '功能复杂度不合法，请确保复杂度为“高”、“中”或“低”',
          type: 'warning',
        });
        return false; // 输入不合法
      }

      return true; // 输入合法
    };

    // 计算未调整功能点数
    const submitData = async () => {
      if (!validateInputs()) return; // 验证输入信息
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
    async function autoEvaluate(subFunctionId:number) {
      if (subFunctionId !== null) {
        try {
          const response = await fetch('http://localhost:8000/api/autoEvaluate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subFunctionId: subFunctionId,
              subFunctionName: subFunctions.value.find(sub => sub.id === subFunctionId)?.name || '',
              description: '无描述'
            })
          });
          if (response.ok) {
            const data = await response.json();
            // 更新页面上的表单数据
            inputData.value.ILF = data.ilf;
            inputData.value.EIF = data.eif;
            inputData.value.EI = data.ei;
            inputData.value.EO = data.eo;
            inputData.value.EQ = data.eq;
            inputData.value.ILFComplexity = data.ilfComplexity;
            inputData.value.EIFComplexity = data.eifComplexity;
            inputData.value.EIComplexity = data.eiComplexity;
            inputData.value.EOComplexity = data.eoComplexity;
            inputData.value.EQComplexity = data.eqComplexity;
          } else {
            console.error("Error fetching evaluation:", response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        console.error("Sub-function ID is null");
      }
    }

    //将子功能计算信息和未调整功能点结果传递给后端，保存
    const savedSubFunctionResults = ref<any[]>([]); // 用于存储保存的信息

    //将子功能计算信息和未调整功能点结果传递给后端，保存
    const saveSubFunctionResult = async () => {
      if (!validateInputs()) return; // 验证输入信息
      const subFunctionData = {
        subFunctionId: selectedSubFunction.value,
        subFunctionName: subFunctions.value.find(sub => sub.id === selectedSubFunction.value)?.name || '',
        rootId: rootId,
        rootNodeName: rootNodeName.value,
        ilf: inputData.value.ILF,
        ilfComplexity: inputData.value.ILFComplexity, // 保存 ILF 的复杂度
        eif: inputData.value.EIF,
        eifComplexity: inputData.value.EIFComplexity, // 保存 EIF 的复杂度
        ei: inputData.value.EI,
        eiComplexity: inputData.value.EIComplexity, // 保存 EI 的复杂度
        eo: inputData.value.EO,
        eoComplexity: inputData.value.EOComplexity, // 保存 EO 的复杂度
        eq: inputData.value.EQ,
        eqComplexity: inputData.value.EQComplexity, // 保存 EQ 的复杂度
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
        // 将保存的信息添加到数组中
        savedSubFunctionResults.value.push(subFunctionData)
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

    const router = useRouter();
    // 定义跳转到 assess2 的方法
    const navigateToAssess2 = () => {
      router.push({
        path: '/assess2',
        query: {
          rootId: route.query.rootId, // 传递 rootId
          projectUFP: projectUFP.value // 传递 projectUFP，假设它是一个响应式变量
        },
      });
    };

    //计算项目未调整功能点数
    const projectUFP = ref(""); // 项目未调整功能点数
    const calculateProjectUnadjustedPoints = async () => {
      try {
        const subFunctionIds = subFunctions.value.map((sub) => sub.id); // 获取所有子功能 ID
        const response = await axios.post("http://localhost:9000/api/sub-functions/calculateProjectUFP", subFunctionIds);
        projectUFP.value = response.data; // 设置返回的总 UFP 值
      } catch (error) {
        console.error("计算项目未调整功能点数失败:", error);
      }
    };

    return {
      autoEvaluate,
      savedSubFunctionResults,
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
      calculateProjectUnadjustedPoints,
      submitData,
      saveSubFunctionResult,
      navigateToAssess2,
      returnToProjectList,
      validateInputs,
    };
  }
});
</script>

<style scoped>
/* 全局样式 */
body {
  font-family: 'Noto Sans SC', sans-serif;
  background-color: #f7f9fc;
  color: #333;
  margin: 0;
  padding: 20px;
}

/* 标题样式 */
h1 {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

/* 容器样式 */
.function-structure-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 20px;
}
.el-input,
.el-select {
  border-radius: 4px;
  padding: 8px;
}

/* 树形结构 */
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

/* 按钮样式 */
.el-button {
  border-radius: 4px;
  transition: all 0.3s ease;
}
.el-button:hover {
  background-color: #337AB7;
  color: #fff;
}

/* 保存记录样式 */
.saved-result {
  background-color: #fff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.saved-result p {
  font-weight: bold;
}

.center-container {
  display: flex;
  flex-direction: column;
  height: 87%;
  padding: 30px;
  background: #F5F6F8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
.inline-input-group {
  display: flex;
  align-items: center;
}

.input-label {
  min-width: 50px; /* 设置固定宽度，确保左对齐 */
  text-align: right;
  margin-right: 5px;
}

.aligned-input-row {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}
.inline-input-group {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.input-label {
  min-width: 60px; /* 设置标签的固定宽度，确保对齐 */
  text-align: right; /* 标签右对齐 */
  margin-right: 10px; /* 与文本框之间的间距 */
}
</style>