<template>
  <div id="app" class="relative">
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400 relative" role="toolbar">
      <button class="btn-icon" type="button" @click="addIconArticleForm">
        <img src="@/assets/img/img_1.png" alt="">
      </button>
      <button class="btn-icon" type="button">
        <img src="@/assets/img/img_2.png" alt="">
      </button>
      <button type="button" @click="outputArticle">out</button>
    </div>
    <type-one
        :tag="'div'"
        :editable="editable"
        v-model="article"
        :contents="contents"
    ></type-one>
  </div>
</template>

<script>

import TypeOne from '@/components/type-one';
import {defineComponent, ref} from 'vue';

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
      contents: {
        'type': 'doc',
        'content': [
          {
            'type': 'paragraph',
            'content': [
              {
                'type': 'text',
                'style': ['bold'],
                'text': 'aaaasdfasdfasfasdfasdfasf',
              },
            ],
          },
          {
            'type': 'icon',
            'id': 'icon-1234',
            'icon-type': 'man-anchor',
            'content': [
              {
                'type': 'text',
                'text': 'By default, QEditor offers most if not all the commands you’d need in a WYSIWYG editor: ',
              },
              {
                'type': 'text',
                'style': ['bold'],
                'text': 'bold',
              },
              {
                'type': 'text',
                'style': ['italic'],
                'text': 'italic',
              },
              {
                'type': 'text',
                'style': ['strike'],
                'text': 'strike',
              },
              {
                'type': 'text',
                'style': ['underline'],
                'text': 'underline',
              },
              {
                'type': 'text',
                'text': 'unordered (list), ordered (list), subscript, superscript, link, fullscreen, quote, left (align), center (align), right (align), justify (align), print, outdent, indent, removeFormat, hr, undo, redo, h1 to h6, p (paragraph), code (code paragraph), size-1 to size-7.',
              },
            ],
          },
          {
            'type': 'paragraph',
          },
          {
            'type': 'paragraph',
          },
          {
            'type': 'paragraph',
            'content': [
              {
                'type': 'text',
                'text': '@vue/composition-api가 변경 되었을 때 이를 사용하는 개발자는 API 변경/삭제에 대한 권한이 없다. 그래서 업데이트가 되는 순간 프로젝트에 직접적인 영향을 전파하게 된다. 이런 부분을 나는 외부 의존성이라고 부른다.',
              },
            ],
          },
          {
            'type': 'paragraph',
          },
          {
            'type': 'icon',
            'id': 'icon-2345',
            'icon-type': 'man-anchor',
            'content': [
              {
                'type': 'text',
                'text': 'unordered (list), ordered (list), subscript, superscript, link, fullscreen, quote, left (align), center (align), right (align), justify (align), print, outdent, indent, removeFormat, hr, undo, redo, h1 to h6, p (paragraph), code (code paragraph), size-1 to size-7.',
              },
            ],
          },
        ],
      },
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

    return {
      editable,
      outputArticle,
      toggle,
      update,
      article,
      addIconArticleForm,
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



