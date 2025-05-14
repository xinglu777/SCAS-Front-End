
<template>
  <div class="register-container">
    <h1>欢迎注册</h1>
    <div class="register-box">
      <h2>租户注册</h2>
      <el-input v-model="addedTenant.tenantName" placeholder="请输入租户名称" />
      <el-input v-model="addedTenant.email" placeholder="请输入电子邮箱" />
      <el-input v-model="addedTenant.phone" placeholder="请输入电话" />
      <el-input v-model="addedTenant.password" type="password" placeholder="请输入密码" />
      <div class="vcode-container">
        <Vcode
            :show="isShow"
            @success="success"
            @close="close"
            @fail="fail"
            :imgs="[Img1, Img2, Img3, Img4, Img5]"
        />
      </div>
      <el-button type="primary" class="full-width" @click="handleRegister">注册</el-button>
      <p class="login-link">
        已有账号？<router-link to="/login">点击登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElInput, ElButton, ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import { register } from '@/api/apiList/tenant';
import Img1 from "@/assets/Img1.jpg";
import Img2 from '@/assets/Img2.jpg';
import Img3 from '@/assets/Img3.jpg';
import Img4 from '@/assets/Img4.jpg';
import Img5 from '@/assets/Img5.jpg';
import Vcode from 'vue3-puzzle-vcode';

const router = useRouter();
const isShow = ref<boolean>(false);

interface Tenant {
  tenantName: string;
  email: string;
  phone: string;
  password?: string;
}

let addedTenant = reactive<Tenant>({
  tenantName: '',
  email: '',
  phone: '',
  password: ''
});

const showMessage = (message: string, type = 'success', duration = 3000) => {
  ElNotification({
    title: type === 'success' ? '成功' : '错误',
    message,
    type,
    duration
  });
};

const validatePhone = (value: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(value);
};

const handleRegister = (): void => {
  if (addedTenant.tenantName && addedTenant.email && addedTenant.password) {
    if (validatePhone(addedTenant.phone)) {
      getVerificationCode();
    } else {
      showMessage('电话号码格式不正确', 'error');
    }
  } else {
    showMessage('请填写所有必填项', 'error');
  }
};

const getVerificationCode = () => {
  isShow.value = true;
};

const success = async (msg: any) => {
  isShow.value = false;
  let response: any = await register(addedTenant);
  if (response.code === 1000) {
    if (response.data === "1") {
      showMessage("租户名称重复！", 'error');
    } else {
      showMessage("注册成功！", 'success');
      router.push('/login');
    }
  } else {
    showMessage(response.message || '注册失败', 'error');
  }
};

const close = () => {
  isShow.value = false;
};

const fail = () => {
  showMessage('验证失败', 'error');
};
</script>


<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('../assets/back1.jpg') no-repeat center center;
  background-size: cover;
  color: #333;
}

.register-box {
  width: 350px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
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

.el-input {
  margin-bottom: 15px;
  width: 100%;
}

.vcode-container {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
  margin-top: 10px;
}

.login-link {
  margin-top: 20px;
  color: #409eff;
}

.login-link a {
  text-decoration: none;
  font-weight: bold;
  color: #409eff;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
