import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessageBox } from 'element-plus'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/userLog.vue') // 确保路径和文件名正确
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/userReg.vue') // 确保路径和文件名正确
  },
  {
    path: '/index',
    name: 'index',
    component: () => import('@/Index.vue'),
    children: [
      {
        path: '/course',
        name: 'course',
        component: () => import('@/views/course.vue')
      },
      {
        path:'/reportGeneration',
        name:'reportGeneration',
        component:() =>import('@/views/reportGeneration.vue')
      },
      {
        path:'/dashboards',
        name:'dashboards',
        component:() =>import('@/views/dashboards.vue'),
      },{
        path:'/projectDashBoardList',
        name:'projectDashBoardList',
        component:()=>import('@/views/projectDashBoardList.vue')
      },{
        path:'/reportReview',
        name:'reportReview',
        component:()=>import('@/views/reportReview.vue')
      },{
        path:'/reportReviewEvaluation',
        name:'reportReviewEvaluation',
        component:()=>import('@/views/reportReviewEvaluation.vue')
      },{
        path: '/pfs',
        name: 'pfs',
        component: () => import('@/views/pfs.vue')
      },
      {
        path: '/assess',
        name: 'assess',
        component: () => import('@/views/assess.vue')
      },
      {
        path: '/assess2',
        name: 'assess2',
        component: () => import('@/views/assess2.vue'), // 确保路径正确
      },
      {
        path: '/try',
        name: 'try',
        component: () => import('@/views/pfs.vue')
      },
      {
        path: '/projectEvaluation',
        name: 'projectEvaluation',
        component: () => import('@/views/projectEvaluation.vue')
      },
      {
        path: '/project',
        name: 'Project',
        component: () => import('@/views/Project.vue'), // 父组件
        redirect: '/project/details/:projectName', // 默认跳转到项目详情
        children: [
          {
            path: 'details/:projectName',
            name: 'ProjectDetails', // 项目详情子路由
            component: () => import('@/views/ProjectDetails.vue'),
          },
          {
            path: 'team/:projectName',
            name: 'TeamManagement', // 团队管理子路由
            component: () => import('@/views/TeamManagement.vue'),
          },
        ],
      },
      {
        path: '/TenantManagement',
        name: 'TenantManagement',
        component: () => import('@/views/TenantManagement.vue')
      },
      {
        path: '/ManagerMember',
        name: 'ManagerMember',
        component: () => import('@/views/managerMember.vue')
      },
      {
        path: '/memberManagement',
        name: 'memberManagement',
        component: () => import('@/views/memberManagement.vue')
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


function isLoggedIn(): boolean {
  return !!localStorage.getItem('userToken');
}

/* router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isLoggedIn()) {
    ElMessageBox.alert('请先登录!', '提示', {
      confirmButtonText: '确定',
      type: 'warning'
    }).then(() => {
      next('/login');
    });
  } else {
    next();
  }
});
 */

export default router;
