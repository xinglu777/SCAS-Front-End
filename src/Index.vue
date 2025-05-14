<template>
  <div id="app">
    <header class="header">
      <div class="logo">软件造价评估系统</div>
      <div class="user-info">
        <el-button link type="primary" @click="1">帮助</el-button>
        <el-button link type="primary" @click="1">通知</el-button>
        <el-popover
            placement="bottom"
            width="200"
            trigger="click"
            v-model:visible="popoverVisible">
          <template #reference>
            <el-avatar class="user-avatar" size="large" :src="userAvatar"/>
          </template>
          <div class="popBox">
            <p style="padding: 10px 0 5px 0" @click="1">个人信息</p>
            <p style="color: #e10505" @click="outlogin()">退出登录</p>
          </div>
        </el-popover>
      </div>
    </header>
    <div class="main-content">
      <aside class="sidebar">
        <el-menu
            :default-active="activeTab"
            class="el-menu-vertical-demo"
            background-color="#2d3a4b"
            text-color="#fff"
            active-text-color="#ffd04b"
        >
<!--          <el-menu-item index="course" @click="openTab('course')">-->
<!--            <el-icon><Setting /></el-icon> 界面一-->
<!--          </el-menu-item>-->
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <User></User>
              </el-icon>
              <span>报告生成子系统</span>
            </template >
            <el-menu-item-group>
              <el-menu-item v-for="item in menuItems" :key="item.name" :index="item.name" @click="openTab(item.name)">
                <span>{{ item.label }}</span>
              </el-menu-item>
             
            </el-menu-item-group>
          </el-sub-menu>
          <el-menu-item index="pfs" @click="openTab('pfs')">
  <el-icon><FolderOpened /></el-icon> 功能结构管理
</el-menu-item>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><User /></el-icon>
              <span>项目评估子系统</span>
            </template>
            <el-menu-item-group>
              <!-- 当 userType 不等于 2 时显示项目评估 -->
              <el-menu-item
                  index="projectEvaluation"
                  @click="openTab('projectEvaluation')"
              >
                项目评估
              </el-menu-item>

              <!-- 当 userType 不等于 0 且不等于 2 时显示成员管理 -->
              <el-menu-item
                  index="memberManagement"
                  @click="openTab('memberManagement')"
              >
                成员管理
              </el-menu-item>

              <!-- 当 userType 不等于 0 且不等于 1 时显示租户管理 -->
              <el-menu-item
                  index="TenantManagement"
                  @click="openTab('TenantManagement')"
              >
                租户管理
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>

        </el-menu>
      </aside>
      <main class="content">
        <div class="tabs">
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick" @tab-remove="removeTab" closable>
            <el-tab-pane
                v-for="tab in tabs"
                :key="tab.name"
                :label="tab.label"
                :name="tab.name">
              <router-view :key="tab.name"></router-view>
            </el-tab-pane>
          </el-tabs>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref,onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import service from './api';
interface Tab {
  name: string;
  label: string;
  path: string;
}

export default defineComponent({
  name: 'App',
  setup() {
  
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const userAvatar = require('@/assets/image.png');
    const activeTab = ref();
    const tabs = ref<Tab[]>([]);
    const popoverVisible = ref(false);
    const userRole = ref("role2");
    // 在 setup 中
    const userType = ref(localStorage.getItem('userType') || ''); // 获取 userType

    // 动态菜单选项
    const menuItems = ref([
      { name: 'reportGeneration', label: '报告生成', roles: ['role1'] },
      { name: 'projectDashBoardList', label: '看板列表', roles: ['role3'] },
      { name: 'reportReview', label: '报告审核', roles: ['role2'] },
      { name: 'reportReviewEvaluation', label: '评估报告审核', roles: ['role1'] }
    ]);
    const filteredMenuItems = ref(menuItems.value.filter(item => item.roles.includes('role2' as string)));
    onMounted(async ()=>{
      const localTab=localStorage.getItem('activeTab')
      if(localTab){
        openTab(localTab)
      }
  } )
    const getTabLabel = (tabName: string) => {
      switch (tabName) {
        case 'course':
          return '界面一';
        case 'reportGeneration':
          return '报告生成';
        case 'projectDashBoardList':
          return '看板列表';
        case 'reportReview':
          return '报告审核';
        case 'reportReviewEvaluation':
          return '评估报告审核';
          case 'pfs':
      return '功能结构管理';
        case 'projectEvaluation':
          return '项目评估';
        case 'memberManagement':
          return '成员管理';
        case 'TenantManagement':
          return '租户管理';
        default:
          return tabName;
      }
    };

    const handleTabClick = (tab: any) => {
      const selectedTab = tabs.value.find((t) => t.name === tab.props.name);
      if (selectedTab) {
        router.push({ path: selectedTab.path });
      }
    };

    const outlogin = () => {
      router.push('/login');
    };

    const removeTab = (tabName: string) => {
      const tabIndex = tabs.value.findIndex((t) => t.name === tabName);
      tabs.value.splice(tabIndex, 1);
      localStorage.setItem('tabs', JSON.stringify(tabs.value));
      if (activeTab.value === tabName) {
        activeTab.value = tabs.value.length ? tabs.value[0].name : '';
        localStorage.setItem('activeTab', activeTab.value);
        if (activeTab.value) {
          const nextTab = tabs.value.find((t) => t.name === activeTab.value);
          if (nextTab) {
            router.push({ path: nextTab.path });
          }
        } else {
          router.push('/index');
        }
      }
    };

    const openTab = (tabName: string) => {
      const tab = tabs.value.find((t) => t.name === tabName);
      if (!tab) {
        const newTab = {
          name: tabName,
          label: getTabLabel(tabName),
          path: `/${tabName}`
        };
        tabs.value.push(newTab);
        localStorage.setItem('tabs', JSON.stringify(tabs.value));
      }
      activeTab.value = tabName;
      localStorage.setItem('activeTab', tabName);
      router.push({ path: `/${tabName}` });
    };

    return {
      activeTab,
      tabs,
      popoverVisible,
      userAvatar,
      userRole,
      menuItems,
      filteredMenuItems,
      handleTabClick,
      removeTab,
      openTab,
      outlogin,
      userType
    };
  }
});
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #001529;
  color: #fff;
  height: 50px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.nav .el-button {
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info .el-button {
  color: #fff;
  margin-right: 15px; /* 增加右边距来增加按钮和头像之间的距离 */
}

.user-avatar {
  margin-left: 15px; /* 增加左边距来进一步拉开距离 */
  width: 40px; /* 设置头像的宽度 */
  height: 40px; /* 设置头像的高度 */
}

.popBox {
  padding: 10px;
}

.main-content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background-color: #2d3a4b;
}

.content {
  flex: 1;
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 20px;
  overflow-y: auto;
}

.tabs {
  width: 100%;
}


.user-info-dialog .info-item {
  margin: 10px 0;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #e0e0e0;
}

.user-info-dialog .info-item span {
  font-weight: bold;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
