<template>
  <div id="app" class="relative"  @remove="remove">
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400 relative" role="toolbar">
      <button class="btn-icon" type="button" @click="addIconArticleForm">
        <img src="@/assets/img/img_1.png">
      </button>
      <button class="btn-icon" type="button">
        <img src="@/assets/img/img_2.png">
      </button>
      <button type="button" @click="outputArticle">out</button>
    </div>
    <type-one
        :tag="'div'"
        :editable="editable"
        v-model="article"
        @remove="remove"
    ></type-one>
  </div>
</template>

<script>

import TypeOne from '@/components/type-one';
import { defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    TypeOne,
  },
  props: {},
  data() {
    return {
      iconList: [
        {type: 'anchor-male-shot', icon: 'img_1.png'},
        {type: 'anchor-female-shot', icon: 'img_2.png'},
      ],
    };
  },
  emits: [],
  setup() {
    const article = ref({});
    const editable = ref(true);

    const outputArticle = () => {
      console.log('outputArticle', article.value);
    };

    const toggle = () => {
      console.log('toggle');
      editable.value = !editable.value;
    };

    const update = () => {
      console.log('update');
      // article.value = data;
      outputArticle();
    };

    const addIconArticleForm = () => {
      // 아이콘 영역 추가를 위한 eventBus
      window.EventBus.emit('emitAddIconArticleForm', window.getSelection().getRangeAt(0));
    };

    const remove = (id) => {
      console.log('remove3', id);
      this.$.appContext.app.unmount();
    }

    return {
      editable,
      outputArticle,
      toggle,
      update,
      article,
      addIconArticleForm,
      remove,
    };
  },
});
</script>

<style>
#app {
  @apply h-screen w-screen bg-blue-100
}

.icon-wrapper {
  @apply w-full p-3 bg-black text-white rounded-lg select-none cursor-pointer
}
</style>



