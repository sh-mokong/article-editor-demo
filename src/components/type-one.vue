<template>
  <component
      :is="tag"
      class="w-full h-full relative outline-none p-2"
      ref="element"
      id="editor"
      :contenteditable="editable"
      @input="update"
      @blur="update"
      @remove="remove"
  >
  </component>
</template>

<script>
import {createApp, defineComponent, nextTick, onMounted, ref} from 'vue';
import IconArticleForm from './IconArticleForm';

export default defineComponent({
  name: 'type-one',
  emits: ['update:modelValue', 'toggleEditable', 'remove'],
  props: {
    tag: String,
    editable: {
      type: Boolean,
      default: true,
    },
    modelValue: String,
    noHTML: {
      type: Boolean,
      default: true,
    },
    noNL: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit}) {
    const element = ref(null);
    const article = ref({});

    const setClickActions = () => {
      console.log(props.editable);
      emit('toggleEditable');
    };

    function currentContent() {
      let html = props.noHTML ? element.value.innerText : element.value.innerHTML;
      // console.log(html);
      html = element.value.innerHTML;
      return html;
    }

    const update = () => {
      emit('update:modelValue', currentContent());
    };

    const removeIconArticleForm = (id) => {
      console.log('remove Type-One', id);
      // emit('remove', id);
    };

    const addIconArticleForm = (range) => {

      const timeStamp = new Date().getTime();
      const selection = window.getSelection();

      // vue component 를 마운트 시킬 pre wrapper 생성
      const temp = document.createElement('pre');
      temp.classList.add('icon-wrapper');
      temp.setAttribute('id', `icon-${timeStamp.toString()}`);

      if (selection) {
        range.deleteContents();
        range.insertNode(temp);
        selection.removeAllRanges();
      }

      nextTick(() => {
        // 생성한 pre wrapper 에 component 를 마운트
        createApp(IconArticleForm,
            {
              id: `icon-${timeStamp.toString()}`,
              imgLink: '', message: '테스트 테스트 123123123\nnasdfjklasjdflkjalsdjlf\nasfdqweuroiuwqreoiasjfjlk',
            }).mount(`#icon-${timeStamp.toString()}`);
      });

    };

    onMounted(() => {
      console.log('onMounted Type-One!');
      console.log(props.modelValue);

      // 아이콘영역 추가를 위한 eventBus 추가
      window.EventBus.on('emitAddIconArticleForm', (range) => {
        console.log('window.EventBus.on(\'emitIconArticleForm\')', range);
        addIconArticleForm(range);
      });

      window.EventBus.on('emitRemoveIconArticleForm', (id) => {
        console.log('window.EventBus.on(\'emitRemoveIconArticleForm\')', id);
        removeIconArticleForm(id);
      });
    });

    return {
      element,
      article,
      update,
      setClickActions,
    };
  },
});
</script>

<style scoped>
#editor {
  @apply bg-white h-full w-full
}

#editor[contenteditable="true"] {
  @apply bg-green-200
}

#editor[contenteditable="false"] {
  @apply bg-red-100
}
</style>
