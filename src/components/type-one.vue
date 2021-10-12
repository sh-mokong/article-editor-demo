<template>
  <component
      :is="tag"
      class="w-full h-full relative outline-none editor-body"
      ref="element"
      id="editor"
      tabindex="0"
      :contenteditable="editable"
      :article-id="articleId"
      @input="update"
      @blur="update"
  >
    <div><br></div>
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
    articleId: String,
    modelValue: Object,
    noHTML: {
      type: Boolean,
      default: true,
    },
    noNL: {
      type: Boolean,
      default: false,
    },
    contents: {
      type: Object,
      default: () => {
      },
    },
  },
  setup(props, {emit}) {
    const element = ref();
    const article = ref({});

    const setClickActions = () => {
      console.log(props.editable);
      emit('toggleEditable');
    };

    const currentContent = () => {
      // let html = props.noHTML ? element.value.innerText : element.value.innerHTML;
      // console.log(html);
      // html = element.value.innerHTML;
      return element.value;
    };

    const update = () => {
      emit('update:modelValue', currentContent());
    };

    const removeIconArticleForm = (id) => {
      console.log('remove Type-One', id);
      document.getElementById(id).remove();
    };

    const addIconArticleForm = (range, type) => {
      // 아이콘 영역 추가
      const timeStamp = new Date().getTime();
      const selection = window.getSelection();
      const message = '';

      // vue component 를 마운트 시킬 pre wrapper 생성
      const temp = document.createElement('div');
      temp.classList.add('icon-wrapper');

      temp.setAttribute('contenteditable', false);
      temp.setAttribute('id', `icon-${timeStamp.toString()}`);
      temp.dataset.iconType = type;

      if (type === 'female') {
        temp.classList.add('type-icon');
      }

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
              imgLink: '', message: message,
              iconType: type,
            }).mount(`#icon-${timeStamp.toString()}`);
      });
    };

    const parseJsonToContentEdit = (contents) => {
      // TODO :: content 데이터가 있는 경우 화면에 렌더링
      for (const property in contents) {
        console.log(`${property}: ${contents[property]}`);
      }
      makeDomNodeTree('div');
    };

    const makeDomNodeTree = (node) => {
      console.log(node);
    };

    onMounted(() => {
      console.log('onMounted Type-One!');

      // 아이콘 영역 추가를 위한 eventBus 추가
      window.EventBus.on('emitAddIconArticleForm', ({selection, type}) => {
        console.log('emitIconArticleForm', selection);
        addIconArticleForm(selection, type);
      });

      // 아이콘 영역 삭제를 위한 eventBus 추가
      window.EventBus.on('emitRemoveIconArticleForm', (id) => {
        console.log('emitRemoveIconArticleForm', id);
        removeIconArticleForm(id);
      });

      // json to element
      window.EventBus.on('emitParseJsonToContent', (jsonData) => {
        console.log('emitParseJsonToContent', jsonData);
        parseJsonToContentEdit(jsonData);
      });

      if (props.contents !== null) {
        // contents json 값을 화면에 파싱
        console.log(props.contents);
        parseJsonToContentEdit(props.contents);
      }

      element.value.addEventListener('paste', (event) => {
        const paste = (event.clipboardData || window.clipboardData).getData('text');
        const temp = paste.split(/\n/g);
        const selection = window.getSelection();

        if (!selection.rangeCount) {
          return false;
        }

        selection.getRangeAt(0).deleteContents();

        let rows = document.createElement('div');

        temp.forEach((text) => {
          let row = document.createElement('div');
          if (text) {
            row.innerText = text.toString();
          } else {
            row.innerHTML = '<br>';
          }
          rows.appendChild(row);
        });

        selection.getRangeAt(0).insertNode(rows);
        event.preventDefault();
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
  @apply bg-white h-full w-full p-2
}

.editor-body::v-deep(p) {
  line-height: 1rem;
  height: 1.5rem;
}
</style>
