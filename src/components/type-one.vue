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
      @keyup.ctrl="undoRedo"
      @keyup.meta="undoRedo"
  >
    <div><br></div>
  </component>
</template>

<script>

import {createApp, defineComponent, nextTick, onMounted, ref, watch} from 'vue';
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
  setup: function(props, {emit}) {
    const selection = window.getSelection();
    const element = ref();
    const lastSelection = {
      event: '',
      range: 0,
      anchorNode: 0,
      anchorOffset: 0,
    };

    const currentContent = () => {
      if (selection && selection.anchorNode !== null) {
        lastSelection.range = selection.getRangeAt(0);
        lastSelection.index = selection.anchorOffset;
      }
      console.log('currentContent');

      // TODO :: 기사 예상시간 처리하기 - 아이콘 영역을 제거한 dom tree 에서 innerText 뽑아서 처리
      return element.value;
    };

    const update = () => {
      emit('update:modelValue', currentContent());
    };

    /**
     * undo, redo 를 위한 history 생성하기
     */
    const addHistoryStack = () => {
      console.log('addHistoryStack');
      emit('makeHistory', currentContent());
    };

    /**
     * 아이콘 영역 삭제
     */
    const removeIconArticleForm = (id) => {
      console.log('remove Type-One', id);
      document.getElementById(id).remove();
      // window.EventBus.emit('emit:emitSelectIconArticleForm', {status: true});
      addHistoryStack();
    };

    /**
     * 아이콘 영역 추가
     */
    const addIconArticleForm = (type) => {
      // if (!iconAddEnable.value) {
      //   return;
      // }
      console.log('addIconArticleForm', type, lastSelection.range);
      const timeStamp = new Date().getTime();
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

      const position = lastSelection.range;
      position.insertNode(temp);
      // document.execCommand('insertHTML', true, temp.outerHTML);

      nextTick(() => {
        setMountIconArticleForm({id: `icon-${timeStamp.toString()}`, type: type, message: message});
      });

      addHistoryStack();
    };

    /**
     * JSON 데이터를 에디터 콘텐츠로 변환
     */
    const parseJsonToContentEdit = (content) => {
      console.log('parseJsonToContentEdit', content);
      const {text} = content;
      const icon = JSON.parse(content.icon);
      console.log(typeof text, typeof icon);
      const rows = createRow(text, icon);

      console.log('text, icon', text, icon);
      element.value.innerHTML = rows.outerHTML;

      nextTick(() => {
        // 생성한 pre wrapper 에 component 를 마운트
        for (let id in icon) {
          setMountIconArticleForm({id: id, type: icon[id].iconType, message: icon[id].text});
        }
      });
      const selection = window.getSelection();

      const range = document.createRange();
      selection.removeAllRanges();
      range.selectNodeContents(element.value);
      range.collapse(false);
      element.value.focus();

    };

    /**
     * 생성한 icon wrapper 에 vue component mount
     */
    const setMountIconArticleForm = ({id, type, message}) => {
      // component mount
      createApp(IconArticleForm,
          {
            id: id,
            imgLink: '',
            message: message,
            iconType: type,
          }).mount(`#${id}`);
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
      if (selection && selection.anchorNode !== null) {
        const range = selection.getRangeAt(0);
        lastSelection.event = $event;
        lastSelection.range = range;
        lastSelection.anchorOffset = selection.anchorOffset;
        lastSelection.anchorNode = selection.anchorNode;
      }
    };

    const focusIn = () => {
      // console.log('focus In');
      window.EventBus.emit('emitSelectIconArticleForm', {status: true});
      console.log('emit:emitSelectIconArticleForm');
    };

    const focusOut = () => {
      // console.log('focus Out');
      // update();
    };

    const pasteEvent = ($event) => {
      // 붙여넣기 이벤트
      $event.preventDefault();

      // 붙여넣기 이전 상태 undo stack 에 추가
      addHistoryStack();

      // const paste = ($event.clipboardData || window.clipboardData).getData('text/plain');
      // document.execCommand('insertText', false, paste);
      // addHistoryStack();

      const paste = ($event.clipboardData || window.clipboardData).getData('text');

      if (!selection.rangeCount) {
        return false;
      }

      const rows = createRow(paste);
      document.execCommand('insertHTML', true, rows.outerHTML);

      // 붙여넣기 이후 상태 undo stack 에 추가
      addHistoryStack();
    };

    /**
     * 텍스트, 아이콘을 각각 한줄 씩 생성
     */
    const createRow = (text, icon) => {
      console.log(`createRow : text:${text}, icon:${icon}`, typeof icon);
      // 붙여넣기, 되돌리기 등 에디터에 들어갈 텍스트 생성
      const wrapper = document.createElement('div');
      const tempText = text?.split(/\n/g);
      const tempIcon = [];

      if (icon !== undefined && Object.keys(icon).length !== 0) {
        for (let id in icon) {
          tempIcon[icon[id].position.line - 1] = icon[id];
          tempIcon[icon[id].position.line - 1].id = id;
        }
      }

      tempText.forEach((text, index) => {
        const row = document.createElement('div');
        const icon = document.createElement('div');

        if (tempIcon[index] !== undefined) {
          icon.classList.add('icon-wrapper');
          icon.setAttribute('contenteditable', false);
          icon.setAttribute('id', tempIcon[index].id);
          icon.dataset.iconType = tempIcon[index].iconType;

          if (tempIcon[index].iconType === 'female') {
            icon.classList.add('type-icon');
          }
        }

        if (text) {
          if (tempIcon[index] !== undefined) {
            const str = [
              text.slice(0, tempIcon[index].position.index),
              text.toString().slice(tempIcon[index].position.index)];
            row.innerHTML = str[0] + icon.outerHTML + str[1];
          } else {
            row.innerHTML = text;
          }
        } else {
          if ((index + 1) !== tempText.length) {
            row.innerHTML = '<br>';
          }
        }

        wrapper.appendChild(row);
      });

      return wrapper;
    };

    // eslint-disable-next-line no-unused-vars
    const undoRedo = ($event) => {
      // ctrl, meta + z / ctrl, meta + shift + z 눌렀을 때만
      if ($event.shiftKey === true && $event.code === 'KeyZ') {
        $event.preventDefault();
        emit('redo');
      } else if ($event.shiftKey === false && $event.code === 'KeyZ') {
        $event.preventDefault();
        emit('undo');
      }
    };

    watch(() => props.contents, (newValue, oldValue) => {
      // undo, redo 를 위해 props.contents 를 watch
      console.log('Watch props.contents changes:', oldValue, newValue);
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
