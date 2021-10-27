<template>
  <component
      :is="tag"
      class="w-full h-full relative outline-none editor-body"
      ref="element"
      id="editor"
      tabindex="0"
      :contenteditable="true"
      :article-id="articleId"
      @input="update"
      @focusin.self="focusIn"
      @focusout="focusOut"
      @paste="pasteEvent"
      @keyup.space="addHistoryStack"
      @keyup.enter="addHistoryStack"
      @keyup.delete="addHistoryStack"
      @keydown.ctrl="undoRedo"
      @keydown.meta="undoRedo"
  >
    <div><br></div>
  </component>
</template>

<script>

// eslint-disable-next-line no-unused-vars
import {createApp, defineComponent, nextTick, onMounted, ref, toRefs, watch} from 'vue';
// eslint-disable-next-line no-unused-vars
import IconArticleForm from './IconArticleForm';

export default defineComponent({
  name: 'type-one',
  emits: ['update:modelValue', 'makeHistory', 'undo', 'redo'],
  props: {
    tag: String,
    articleId: String,
    contents: {
      type: Object,
      default: () => {
      },
    },
  },
  setup(props, {emit}) {
    const selection = window.getSelection();
    const element = ref();
    const lastSelection = {
      event: '',
      selection: {
        range: 0,
        index: 0,
      },
    };

    const currentContent = () => {
      if (selection && selection.anchorNode !== null) {
        lastSelection.selection.range = selection.getRangeAt(0);
        lastSelection.selection.index = selection.anchorOffset;
      }
      console.log('currentContent');

      /**
       * TODO :: 기사 예상시간 처리하기
       * 아이콘 영역을 제거한 dom tree 에서 innerText 뽑아서 처리
       */

      return element.value;
    };

    const update = () => {
      emit('update:modelValue', currentContent());
    };

    const addHistoryStack = () => {
      console.log('addHistoryStack');
      emit('makeHistory', currentContent());
    };

    // 아이콘 영역 삭제
    const removeIconArticleForm = (id) => {
      console.log('remove Type-One', id);
      document.getElementById(id).remove();
      // window.EventBus.emit('emit:emitSelectIconArticleForm', {status: true});
      addHistoryStack();
    };

    // 아이콘 영역 추가
    const addIconArticleForm = (type) => {
      console.log('addIconArticleForm', type, lastSelection.selection.range);
      const timeStamp = new Date().getTime();
      // eslint-disable-next-line no-unused-vars
      const message = '';

      // vue component 를 마운트 시킬 wrapper 생성
      const temp = document.createElement('div');
      temp.classList.add('icon-wrapper');

      temp.setAttribute('contenteditable', false);
      temp.setAttribute('id', `icon-${timeStamp.toString()}`);
      temp.dataset.iconType = type;

      if (type === 'female') {
        temp.classList.add('type-icon');
      }

      document.execCommand('insertHTML', true, temp.outerHTML);

      // TODO :: component 를 마운트 하면 undo/redo 가 안됨
      // innerHTML 만 되돌린 경우 인터렉션이 작동하지 않음
      nextTick(() => {
        // 생성한 pre wrapper 에 component 를 마운트
        createApp(IconArticleForm,
            {
              id: `icon-${timeStamp.toString()}`,
              imgLink: '', message: message,
              iconType: type,
            }).mount(`#icon-${timeStamp.toString()}`);
      });

      addHistoryStack();
    };

    const parseJsonToContentEdit = (contents) => {
      // eslint-disable-next-line no-unused-vars
      const {text, icon} = contents;

      const rows = createRow(text, icon);
      element.value.innerHTML = rows.outerHTML;
      addHistoryStack();
    };

    onMounted(() => {
      // 아이콘 영역 추가를 위한 eventBus 추가
      window.EventBus.on('emitAddIconArticleForm', ({type}) => {
        console.log('on:emitIconArticleForm', type);
        addIconArticleForm(type);
      });

      // 아이콘 영역 삭제를 위한 eventBus 추가
      window.EventBus.on('emitRemoveIconArticleForm', (id) => {
        // TODO :: 아이콘 삭제 시 커서위치를 아이콘 시작 위치로 설정하기
        console.log('on:emitRemoveIconArticleForm', id);
        removeIconArticleForm(id);
      });

      // new line top
      window.EventBus.on('emitAddNewLineTop', (jsonData) => {
        console.log('on:emitAddNewLineTop', jsonData);
      });

      // new line bottom
      window.EventBus.on('emitAddNewLineBottom', (jsonData) => {
        console.log('on:emitAddNewLineBottom', jsonData);
      });

      if (Object.keys(props.contents).length !== 0) {
        // contents json 값을 화면에 파싱
        console.log('props.contents !== null', props.contents);
        parseJsonToContentEdit(props.contents);
      }
    });

    const getMousePointPosition = ($event) => {
      lastSelection.event = $event;
      if (selection && selection.anchorNode !== null) {
        lastSelection.selection.range = selection.getRangeAt(0);
        lastSelection.selection.index = selection.anchorOffset;
        // console.log('getMousePointPosition', $event, $event.currentTarget, $event.target);
      }
    };

    const focusIn = () => {
      console.log('focus In');
      window.EventBus.emit('emitSelectIconArticleForm', {status: true});
      console.log('emit:emitSelectIconArticleForm');
    };

    const focusOut = () => {
      console.log('focus Out');
      // update();
    };

    const pasteEvent = ($event) => {
      // 붙여넣기 이벤트
      $event.preventDefault();
      // const paste = ($event.clipboardData || window.clipboardData).getData('text/plain');
      // document.execCommand('insertText', false, paste);
      // addHistoryStack();

      const paste = ($event.clipboardData || window.clipboardData).getData('text');

      if (!selection.rangeCount) {
        return false;
      }
      const rows = createRow(paste);
      document.execCommand('insertHTML', true, rows.outerHTML);
      addHistoryStack();
    };

    // eslint-disable-next-line no-unused-vars
    const createRow = (text, icon) => {
      // 붙여넣기, 되돌리기 등 에디터에 들어갈 텍스트 생성
      const temp = text.split(/\n/g);
      let wrapper = document.createElement('div');

      console.log(text, icon, temp);

      // eslint-disable-next-line no-unused-vars
      temp.forEach((text, index) => {
        let row = document.createElement('div');
        if (text) {
          row.innerText = text.toString();
        } else {
          row.innerHTML = '<br>';
        }
        wrapper.appendChild(row);
      });
      return wrapper;
    };

    const undoRedo = ($event) => {
      if ($event.shiftKey === true && $event.code === 'KeyZ') {
        $event.preventDefault();
        emit('redo');
      } else if ($event.shiftKey === false && $event.code === 'KeyZ') {
        $event.preventDefault();
        emit('undo');
      }
    };

    watch(() => props.contents, (newValue, oldValue) => {
      console.log(
          'Watch props.contents changes:', oldValue, newValue,
      );
      parseJsonToContentEdit(newValue);
    });

    return {
      element,
      update,
      getMousePointPosition,
      focusIn,
      focusOut,
      pasteEvent,
      addHistoryStack,
      undoRedo,
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

#editor > * {
  font-family: inherit;
}
</style>
