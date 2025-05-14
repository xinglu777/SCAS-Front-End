<script setup lang="ts">
import { onMounted, ref ,defineProps, watch} from 'vue';
const props = defineProps<{url:string,}>();
const pdfUrl = ref(''); // pdf文件地址
const fileUrl = '/pdfjs/web/viewer.html?file='; // pdfjs文件地址

onMounted(() => {
  // encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。
  // 核心就是将 iframe 的 src 属性设置为 pdfjs 的地址，然后将 pdf 文件的地址作为参数传递给 pdfjs
  // 例如：http://localhost:8080/pdfjs-4.0.189-dist/web/viewer.html?file=http%3A%2F%2Flocalhost%3A8080%2Fpdf%2Ftest.pdf
  pdfUrl.value = fileUrl + encodeURIComponent(props.url);
  console.log(pdfUrl.value)
});
watch(
            () => props.url,
            () => {
              console.log(pdfUrl.value)
              pdfUrl.value = fileUrl + encodeURIComponent(props.url);
            }
        );
</script>

<template>
  <div class="container">
    <div v-if="!pdfUrl" class="loading">Loading PDF...</div>
    <iframe v-else :src="pdfUrl" width="100%" height="100%" frameborder="0"></iframe>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
}
</style>
