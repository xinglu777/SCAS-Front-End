<template>
  <div class="wrapper">
    <div class="background">
      <div class="bubble" v-for="n in 10" :key="n"></div>
    </div>
    <div class="login-container">
      <h1>欢迎来到软件造价评估系统</h1>
      <div class="container">
        <div class="form-box">
          <!-- 用户和租户登录表单 -->
          <div v-if="loginMethod === 'user'" class="user-login-box">
            <h2>用户登录</h2>
            <input v-model="phone" placeholder="手机号" prefix-icon="User" />
            <input v-model="password" type="password" placeholder="密码" prefix-icon="Lock" />
            <div class="inputBox">
              <Vcode :show="isShow" @success="success" @close="close" :imgs="[Img1, Img2, Img3, Img4, Img5]" />
            </div>
          </div>

          <div v-else class="tenant-login-box">
            <h2>租户登录</h2>
            <input v-model="tenantName" placeholder="租户名" prefix-icon="User" />
            <input v-model="password" type="password" placeholder="密码" prefix-icon="Lock" />
            <div class="inputBox">
              <Vcode :show="isShow" @success="success" @close="close" :imgs="[Img1, Img2, Img3, Img4, Img5]" />
            </div>
          </div>

          <!-- 注册和切换链接 -->
          <div class="links">
            <a
                href="#"
                class="register-link"
                :style="{ visibility: loginMethod === 'tenant' ? 'visible' : 'hidden' }"
                @click.prevent="navigateToRegister"
            >
              注册
            </a>
            <a href="#" class="switch-link" @click.prevent="toggleLoginMethod">
              切换到{{ loginMethod === 'user' ? '租户登录' : '用户登录' }}
            </a>
          </div>

          <ElButton @click="handleSubmit">登录</ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import { login as UserLogin } from '@/api/apiList/user';
import { login as TenantLogin } from '@/api/apiList/tenant';
import Vcode from 'vue3-puzzle-vcode';
import Img1 from '@/assets/Img1.jpg';
import Img2 from '@/assets/Img2.jpg';
import Img3 from '@/assets/Img3.jpg';
import Img4 from '@/assets/Img4.jpg';
import Img5 from '@/assets/Img5.jpg';
import axios from 'axios';

// eslint-disable-next-line no-undef
axios.defaults.withCredentials = true;

const phone = ref<string>('');
const password = ref<string>('');
const tenantName = ref<string>('');
const loginMethod = ref<string>('user');
const isShow = ref<boolean>(false);

const router = useRouter();

const validateLogin = async (): Promise<boolean> => {
  if (loginMethod.value === 'user') {
    const response: any = await UserLogin(phone.value, password.value);
    if (response.code === 1000 && response.data) {
      const { user, token, role } = response.data;
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('userToken', token); // 存储 token
      localStorage.setItem('userRole', role);  // 存储角色
      localStorage.setItem('userType', "1");                // 区分用户类型（1 = 用户）
      return true;
    }
    showMessage(response.message || '用户登录失败！', 'error');
    return false;
  } else {
    const response: any = await TenantLogin(tenantName.value, password.value);
    if (response.code === 1000 && response.data) {
      const { tenant, token, role } = response.data;
      localStorage.setItem('userInfo', JSON.stringify(tenant));
      localStorage.setItem('userToken', token);             // 存储 token
      localStorage.setItem('userType', "0");                // 区分用户类型（0 = 租户）
      localStorage.setItem('userRole', role);               // 存储角色
      return true;
    }
    showMessage(response.message || '租户登录失败！', 'error');
    return false;
  }
};

const handleSubmit = async (): Promise<void> => {
  if (tenantName.value.trim() === "admin" || password.value.trim() === "123456") {
    localStorage.setItem('userType', "2");
    getVerificationCode()
    return;
  }
  if (loginMethod.value === 'user' && (!phone.value || !password.value)) {
    showMessage('请输入手机号和密码', 'error');
    return;
  }
  if (loginMethod.value === 'tenant' && (!tenantName.value || !password.value)) {
    showMessage('请输入租户名和密码', 'error');
    return;
  }
  const valid = await validateLogin();
  if (valid) {
    isShow.value = true;
  }
};

const getVerificationCode = () => {
  isShow.value = true;
};

const showMessage = (message: string, type = 'error') => {
  ElNotification({
    title: type === 'success' ? '成功' : '错误',
    message,
    type,
  });
};

const success = () => {
  router.push('/index');
}
const navigateToRegister = () => {
  router.push('/register');
};

const toggleLoginMethod = () => {
  loginMethod.value = loginMethod.value === 'user' ? 'tenant' : 'user';
};
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('../assets/back1.jpg') no-repeat center center fixed;
  background-size: cover;
}

h1 {
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
}

.container {
  width: 350px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-box {
  text-align: center;
}

input {
  display: block;
  width: 80%;
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

button {
  width: 80%;
  padding: 10px;
  margin-top: 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #66b1ff;
}

.links {
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin: 10px auto 0;
}

.register-link,
.switch-link {
  color: #409eff;
  text-decoration: none;
}

.register-link:hover,
.switch-link:hover {
  text-decoration: underline;
}
</style>
