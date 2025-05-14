<template>
  <div class="container">
    <!-- Section 1: 评估师文字和批量删除按钮 -->
    <section class="title-section" style="display: flex; justify-content: space-between; align-items: center;">
      <h2 class="title">评估师</h2>

    </section>

    <el-button
        class="custom-batch-delete-btn"
        type="danger"
        size="large"
        circle
        @click="batchDelete"
        :disabled="selectedIds.length === 0"
        style="width: 30px; height: 30px"
    >
    <el-icon style="font-size: 15px;"><DeleteFilled /></el-icon> <!-- 修改图标大小 -->
    </el-button>


    <!-- Section 2: 单纯的直线 -->
    <hr class="line" />

    <!-- 显示符合条件的评估师成员 -->
    <section class="members-section">
      <div class="members">
        <!-- 成员列表 -->
        <div class="member" v-for="(user, index) in filteredEvaluators" :key="index">
          <div class="avatar-container" style="position: relative; display: inline-block;">
            <!-- 头像部分 -->
            <div class="avatar-wrapper">
              <img :src="user.avatar" alt="Avatar" />
            </div>
            <!-- 删除按钮 -->
            <button
                class="delete-btn"
                @click="edelete(user.userId,0)"
                style="position: absolute; top: -5px; right: -5px; background-color: white; color: black; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 20px; line-height: 22px; text-align: center; cursor: pointer;">
              x
            </button>
          </div>
          <div class="name-and-checkbox">
            <input
                type="checkbox"
                :value="user.userId"
                v-model="selectedIds"
            />
            <p>{{ user.name }}</p>
          </div>
        </div>

        <!-- 添加评估师按钮 -->
        <div class="add-member" :style="{ marginTop: addButtonVerticalOffset + 'px' }">
          <button
              v-if="!['待审核', '评估完成', '审核通过'].includes(prostate)"
              @click="addEvaluator"
          >
            +
          </button>
          <button
              v-else
              class="disabled-btn"
              disabled
          >
            +
          </button>
        </div>
      </div>
    </section>


    <!-- Section 4: 审核员文字 -->
    <section class="title-section">
      <h2 class="title">审核员</h2>
    </section>

    <el-button
        class="custom-batch-delete-btn1"
        type="danger"
        size="large"
        circle
        @click="ebatchDelete"
        :disabled="eselectedIds.length === 0"
        style="width: 30px; height: 30px"
    >
      <el-icon style="font-size: 15px;"><DeleteFilled /></el-icon> <!-- 修改图标大小 -->
    </el-button>

    <!-- Section 5: 单纯的直线 -->
    <hr class="line" />

    <!-- 显示符合条件的审核员成员 -->
    <section class="members-section">
      <div class="members">
        <!-- 成员列表 -->
        <div class="member" v-for="(user, index) in eEvaluators" :key="index">
          <div class="avatar-container" style="position: relative; display: inline-block;">
            <!-- 头像部分 -->
            <div class="avatar-wrapper">
              <img :src="user.avatar" alt="Avatar" />
            </div>
            <!-- 删除按钮 -->
            <button
                class="delete-btn"
                @click="edelete(user.userId,1)"
                style="position: absolute; top: -5px; right: -5px; background-color: white; color: black; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 20px; line-height: 22px; text-align: center; cursor: pointer;">
              x
            </button>
          </div>
          <div class="name-and-checkbox">
            <input
                type="checkbox"
                :value="user.userId"
                v-model="eselectedIds"
            />
            <p>{{ user.name }}</p>
          </div>
        </div>

        <!-- 添加审核员按钮 -->
        <div class="add-member" :style="{ marginTop: addButtonVerticalOffset + 'px' }">
          <button
              v-if="!['评估完成', '审核通过'].includes(prostate)"
              @click="eaddEvaluator"
          >
            +
          </button>
          <button
              v-else
              class="disabled-btn"
              disabled
          >
            +
          </button>
        </div>
      </div>
    </section>

    <el-dialog
        title="选择评估师"
        v-model="dialogVisible"
        width="40%"
    >
      <!-- 搜索框 -->
      <el-input
          v-model="searchQuery"
          placeholder="按名字搜索"
          clearable
          prefix-icon="el-icon-search"
          class="search-bar"
      ></el-input>

      <!-- 评估师列表 -->
      <div class="evaluator-list">
        <div
            class="evaluator-item"
            v-for="(user, index) in filteredEvaluatorsBySearch"
            :key="index"
        >
          <div class="add-avatar-wrapper">
            <img :src="user.avatar" alt="Avatar" />
          </div>
          <div class="name-and-action">
            <p class="name">{{ user.username }}</p>
            <button
                class="add-member-btn"
                @click="addEvaluatorFromDialog(user)"
            >
            </button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">关闭</el-button>
  </span>
    </el-dialog>

    <!-- 审核员弹窗 -->
    <el-dialog
        title="选择审核员"
        v-model="edialogVisible"
        width="40%"
    >
      <!-- 搜索框 -->
      <el-input
          v-model="esearchQuery"
          placeholder="按名字搜索"
          clearable
          prefix-icon="el-icon-search"
          class="search-bar"
      ></el-input>

      <!-- 审核员列表 -->
      <div class="evaluator-list">
        <div
            class="evaluator-item"
            v-for="(user, index) in filteredReviewersBySearch"
            :key="index"
        >
          <div class="add-avatar-wrapper">
            <img :src="user.avatar" alt="Avatar" />
          </div>
          <div class="name-and-action">
            <p class="name">{{ user.username }}</p>
            <button
                class="add-member-btn"
                @click="eaddEvaluatorFromDialog(user)"
            >
            </button>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="edialogVisible = false">关闭</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import {computed, onMounted, reactive, ref, UnwrapRef, watch} from "vue";
import { getTeamCounts, searchProjects } from "@/api/apiList/project";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import {addTeamMember, deleteMember, getIdByName, getState, listTeamMember, searchByIds} from "@/api/apiList/team";
import {memberList, memberUpdate} from "@/api/apiList/member";

interface TeamMember {
  name: string;
  avatar: string;
  selected: boolean;
}

interface ProjectData {
  assessorsCount: number;
  reviewersCount: number;
  projectId: number | null;
  projectName: string;
  tenantId: number;
  imageUrl: string;
  description: string;
  requirement: string;
  creator: string;
  startTime: string;
  deadline: string;
  state: string;
}

interface Teber {
  memberId: number;
  projectId: number;
  userId: number;
  actor: number;
}

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

export default {
  methods: {deleteMember},
  setup() {
    // 获取当前路由，获取传递的 projectName
    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
    const route = useRoute();
    const projectName: string = route.params.projectName as string;
    let pId: number;
    let users: Teber[] = [];
    const members = ref<Member[]>([]); // 初始化为一个空数组
    const selectedIds = ref<number[]>([]); // 存储选中的成员ID
    const eselectedIds = ref<number[]>([]); // 存储选中的成员ID
    let prostate = ref<string>(""); // 初始化 prostate
    const esearchQuery = ref(""); // 审核员搜索框绑定内容


// 根据搜索框内容实时过滤审核员列表
    const filteredReviewersBySearch = computed(() => {
      if (!esearchQuery.value.trim()) return efilteredUsers.value; // 如果没有输入，显示全部
      return efilteredUsers.value.filter((user) =>
          user.username.includes(esearchQuery.value.trim())
      );
    });

    const searchQuery = ref(""); // 搜索框绑定内容

    // 根据搜索框内容实时过滤
    const filteredEvaluatorsBySearch = computed(() => {
      if (!searchQuery.value.trim()) return filteredUsers.value; // 如果没有输入，显示全部
      return filteredUsers.value.filter((user) =>
          user.username.includes(searchQuery.value.trim())
      );
    });

    const ebatchDelete = async () => {
      if (eselectedIds.value.length === 0) {
        ElMessage.warning("没有选中的成员");
        return;
      }

      try {
        for (const userId of eselectedIds.value) {
          await edelete(userId, 1, true);
        }
        ElMessage.success("批量删除成功");
        eselectedIds.value = []; // 清空选中状态
        fetchProjectData(); // 刷新数据
      } catch (error) {
        console.error("批量删除失败:", error);
        ElMessage.error("批量删除失败，请稍后重试");
      }
    };

    const batchDelete = async () => {
      if (selectedIds.value.length === 0) {
        ElMessage.warning("没有选中的成员");
        return;
      }

      try {
        for (const userId of selectedIds.value) {
          await edelete(userId, 0, true);
        }
        ElMessage.success("批量删除成功");
        selectedIds.value = []; // 清空选中状态
        fetchProjectData(); // 刷新数据
      } catch (error) {
        console.error("批量删除失败:", error);
        ElMessage.error("批量删除失败，请稍后重试");
      }
    };

    const edelete = async (userId: number, actor: number, isBatch = false) => {
      try {
        let response : any = await deleteMember(userId, pId, actor);
        if (response && response.code === 1000) {
          if (!isBatch) {
            ElMessage.success("删除成员成功");
          }
          fetchProjectData();
          selectedIds.value = selectedIds.value.filter((id) => id !== userId); // 移除已删除的 ID
        }
      } catch (error) {
        console.error("接口调用出错:", error);
        if (!isBatch) {
          ElMessage.error("删除失败，请稍后重试");
        }
      }
    };

    const filteredEvaluators = computed(() => {
      return members.value
          .filter(member => {
            // 找到当前 member 是否存在于 users 列表中，且对应的 actor 为 0 或 2
            const userInUsers = users.find(user => user.userId === member.userId);
            return member.assess === 1 && userInUsers && (userInUsers.actor === 0 || userInUsers.actor === 2)  && member.state !== 2;
          })
          .map(member => ({
            name: member.username,
            avatar: member.avatar,
            userId: member.userId,
            selected: false,
          }));
    });

    const eEvaluators = computed(() => {
      return members.value
          .filter(member => {
            // 找到当前 member 是否存在于 users 列表中，且对应的 actor 为 0 或 2
            const userInUsers = users.find(user => user.userId === member.userId);
            return member.examine === 1 && userInUsers && (userInUsers.actor === 1 || userInUsers.actor === 2) && member.state !== 2;
          })
          .map(member => ({
            name: member.username,
            avatar: member.avatar,
            userId: member.userId,
            selected: false,
          }));
    });

    const teamMembers = async (projectId: number) => {
      try {
        let response: any = await listTeamMember(projectId);

        if (response && response.code === 1000) {
          users = response.data
          const userIds = users.map((user: { userId: number }) => user.userId);// 提取所有成员的 userId
          let info: any = await searchByIds(userIds);
          members.value = info.data
        }
      } catch (error) {
        console.error("接口调用出错:", error);
      }
    };

    const addEvaluatorFromDialog = (user: { userId: number }) => {
      addTeamMember(user.userId,pId,0)
      fetchProjectData();
      dialogVisible.value = false; // 关闭弹窗
      ElMessage.success("添加评估师成功");
      fetchProjectData();
    };

    const eaddEvaluatorFromDialog = (user: { userId: number }) => {
      addTeamMember(user.userId,pId,1)
      fetchProjectData();
      edialogVisible.value = false; // 关闭弹窗
      ElMessage.success("添加审核员成功");
      fetchProjectData();
    };

    const dialogVisible = ref(false); // 控制弹窗的显示
    const edialogVisible = ref(false); // 控制弹窗的显示
    const filteredUsers = ref<any[]>([]); // 存储筛选出的用户
    const efilteredUsers = ref<any[]>([]); // 存储筛选出的用户

    let userDetails: any[] = []; // 全局变量，用于存储用户信息

    // 从 userDetails 中筛选 assess === 1 的用户
    const efilterAssessUsers = () => {
      if (userDetails.length === 0) {
        console.warn("用户数据为空，请先获取用户列表！");
        return;
      }

      const excludedIds = users
          .filter(user => user.actor === 1 || user.actor === 2)
          .map(user => user.userId);

      efilteredUsers.value = userDetails.filter((user: { examine: number,userId: number,state: number }) => user.examine === 1 && !excludedIds.includes(user.userId)  && user.state !== 2);
      console.log("筛选出的评估师用户:", efilteredUsers.value);
      edialogVisible.value = true; // 打开弹窗
    };

    const efetchTeamMembers = async (tenantId: number) => {
      try {
        // 调用获取团队成员接口
        let response: any = await memberList({ tenantId: tenantId });
        if (response && response.code === 1000) {
          console.log("团队成员数据:", response.data);

          // 提取 userId 列
          userDetails = response.data;
          console.log("团队成员的 userDetails 列表:", userDetails);
          efilterAssessUsers()
        } else {
          console.error("获取团队成员失败:", response.message);
        }
      } catch (error) {
        console.error("接口调用出错:", error);
      }
    };

    // 从 userDetails 中筛选 assess === 1 的用户
    const filterAssessUsers = () => {
      if (userDetails.length === 0) {
        console.warn("用户数据为空，请先获取用户列表！");
        return;
      }

      const excludedIds = users
          .filter(user => user.actor === 0 || user.actor === 2)
          .map(user => user.userId);

      filteredUsers.value = userDetails.filter((user: { assess: number,userId: number,state: number }) => user.assess === 1 && !excludedIds.includes(user.userId) && user.state !== 2);
      console.log("筛选出的评估师用户:", filteredUsers.value);
      dialogVisible.value = true; // 打开弹窗
    };

    const fetchTeamMembers = async (tenantId: number) => {
      try {
        // 调用获取团队成员接口
        let response: any = await memberList({ tenantId: tenantId });
        if (response && response.code === 1000) {
          console.log("团队成员数据:", response.data);

          // 提取 userId 列
          userDetails = response.data;
          console.log("团队成员的 userDetails 列表:", userDetails);
          filterAssessUsers()
        } else {
          console.error("获取团队成员失败:", response.message);
        }
      } catch (error) {
        console.error("接口调用出错:", error);
      }
    };

    // 项目信息
    const projectData = ref<ProjectData>({
      assessorsCount: 0,
      reviewersCount: 0,
      projectId: 0,
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


    // 获取项目数据
    const fetchProjectData = async () => {
      try {
        let response: any = await getIdByName(projectName);
        if (response && response.code === 1000) {
          pId = response.data;
          console.log("pro" + pId)
          if (pId) {
            let response: any = await getState(pId)
            prostate.value = response.data
            console.log("state"+prostate)
            teamMembers(pId)
          }
        } else {
          ElMessage.error("未找到对应的项目数据");
        }
      } catch (error) {
        console.error("获取项目信息出错:", error);
        ElMessage.error("获取项目信息失败");
      }
    };

    // 数据定义
    const state = reactive({
      addButtonVerticalOffset: 20,
      evaluators: reactive<TeamMember[]>([
        { name: "李四", avatar: "avatar1.png", selected: false },
        { name: "王五", avatar: "avatar2.png", selected: false },
        { name: "小明", avatar: "avatar3.png", selected: false },
      ]),
      reviewers: reactive<TeamMember[]>([
        { name: "李四", avatar: "avatar1.png", selected: false },
        { name: "小华", avatar: "avatar4.png", selected: false },
      ]),
    });

    // 添加评估师
    const addEvaluator = () => {
      fetchTeamMembers(projectData.value.tenantId)
    };

    // 添加审核员
    const eaddEvaluator = () => {
      efetchTeamMembers(projectData.value.tenantId)
    };

    // 添加审核员
    const addReviewer = () => {
      const newReviewer: TeamMember = {
        name: `审核员${state.reviewers.length + 1}`,
        avatar: "avatar_new.png",
        selected: false,
      };
      state.reviewers.push(newReviewer);
    };

    onMounted(() => {
      fetchProjectData();
      console.log(users)
    });

    return {
      ...state,
      addEvaluator,
      addReviewer,
      fetchTeamMembers,
      dialogVisible,
      filteredUsers,
      addEvaluatorFromDialog,
      filterAssessUsers,
      filteredEvaluators,
      edelete,
      batchDelete,
      selectedIds,
      eEvaluators,
      eaddEvaluator,
      edialogVisible,
      efilteredUsers,
      eaddEvaluatorFromDialog,
      ebatchDelete,
      eselectedIds,
      filteredEvaluatorsBySearch,
      searchQuery,
      filteredReviewersBySearch,
      esearchQuery,
      prostate
    };
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-section {
  text-align: left;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.line {
  border: none;
  border-top: 2px solid #ccc;
  margin: 0;
  width: calc(94vw - 30px);
  position: relative;
  left: -46vw;
  transform: translateX(50%);
}

.members-section .members {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
}

.member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border: 2px solid black;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-and-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 5px;
}

.name-and-checkbox input[type="checkbox"] {
  margin: 0;
}

.name-and-checkbox p {
  font-size: 1.2rem;
  margin: 0;
}

.add-member {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 140px;
}

.add-member button {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  border: none;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
}

.add-member button:hover {
  background: #bbb;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
  z-index: 1;
}

.delete-btn:hover {
  background-color: darkred;
}

.custom-batch-delete-btn {
  position: fixed; /* 按钮固定在屏幕某处 */
  top: 176px;      /* 距离屏幕顶部 190px，可调整 */
  left: 343px;     /* 距离屏幕右侧 70px，可调整 */
  z-index: 1000;   /* 确保按钮在最前方显示 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}

.custom-batch-delete-btn1 {
  position: fixed; /* 按钮固定在屏幕某处 */
  top: 455px;      /* 距离屏幕顶部 190px，可调整 */
  left: 343px;     /* 距离屏幕右侧 70px，可调整 */
  z-index: 1000;   /* 确保按钮在最前方显示 */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}

.evaluator-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 300px; /* 设置最大高度 */
  overflow-y: auto; /* 超出时滚动 */
  padding: 10px 0;
}

.evaluator-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.evaluator-item:hover {
  background-color: #f1f1f1;
}

.name-and-action {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 15px;
}

.name {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
  white-space: nowrap;
}

.add-avatar-wrapper {
  flex-shrink: 0;
  width: 40px; /* 自定义添加栏头像宽度 */
  height: 40px; /* 自定义添加栏头像高度 */
  border-radius: 50%; /* 圆形头像 */
  overflow: hidden; /* 隐藏超出部分 */
  border: 1px solid #ccc; /* 添加边框 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-avatar-wrapper img {
  width: 100%; /* 确保图片适配容器 */
  height: 100%;
  object-fit: cover; /* 保持图片比例裁剪 */
}

.add-member-btn {
  width: 30px; /* 按钮宽度，圆形直径 */
  height: 30px; /* 按钮高度，圆形直径 */
  background-color: #35bd57; /* 按钮绿色背景 */
  color: #fff; /* 加号白色 */
  font-size: 24px; /* 加号字体大小 */
  font-weight: bold; /* 加号字体加粗 */
  border: none; /* 移除边框 */
  border-radius: 50%; /* 圆形按钮 */
  position: relative; /* 启用相对定位 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 初步居中 */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* 调整加号的垂直位置 */
.add-member-btn::after {
  content: "+"; /* 添加加号 */
  position: relative; /* 相对位置调整 */
  top: 0.5px; /* 手动调整加号的垂直位置，向上移动2px */
  left: 0; /* 确保加号保持水平居中 */
}

/* 悬停样式 */
.add-member-btn:hover {
  background-color: #218838; /* 悬停时更深的绿色 */
}


</style>
