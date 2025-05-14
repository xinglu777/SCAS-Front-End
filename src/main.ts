import { createApp, DefineComponent } from 'vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as Icons from '@element-plus/icons-vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import '@/assets/styles/global.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App);

// 注册所有图标组件
Object.keys(Icons).forEach((key) => {
    app.component(key, (Icons as any)[key]);
});
// 全局注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component as DefineComponent);
}

// 注册 QuillEditor 和 SlideVerify 组件
app.component('QuillEditor', QuillEditor);

app.use(router);
app.use(store);
app.use(ElementPlus, {
    locale: zhCn,
  });

app.mount('#app');
