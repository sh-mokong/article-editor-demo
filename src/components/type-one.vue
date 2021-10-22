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
      @focusout.self="focusOut"
      @click="getMousePointPosition($event)"
      @paste="pasteEvent"
  >
    <div><br></div>
  </component>
</template>

<script>
import {createApp, defineComponent, nextTick, onMounted, ref, watch} from 'vue';
import IconArticleForm from './IconArticleForm';

export default defineComponent({
  name: 'type-one',
  emits: ['update:modelValue', 'toggleEditable', 'remove'],
  props: {
    tag: String,
    articleId: String,
    modelValue: Object,
    contents: {
      type: Object,
      default: () => {
      },
    },
  },
  setup(props, {emit}) {
    const selection = window.getSelection();
    const element = ref();
    const article = ref(props.modelValue);
    const history = {article: [], index: 0};
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

      // undo/redo 용 히스토리 생성
      // TODO :: 히스토리를 다른 에디터들 처럼 단어단위로, 오타 지우는 케이스는 히스토리 생성 안하는걸로
      // undo 중간에 수정사항이 생기는 경우 현재 인덱스에서 변경된 값 생성하기
      if (history.article[history.index - 1] !== element.value.innerHTML) {
        history.article[history.index] = element.value.innerHTML;
        history.index++;
        console.log(history);
      }
      return element.value;
    };

    const update = () => {
      emit('update:modelValue', currentContent());
    };

    // 아이콘 영역 삭제
    const removeIconArticleForm = (id) => {
      console.log('remove Type-One', id);
      document.getElementById(id).remove();
      window.EventBus.emit('emit:emitSelectIconArticleForm', {status: true});
    };

    // 아이콘 영역 추가
    const addIconArticleForm = (type) => {
      console.log('addIconArticleForm', type, lastSelection.selection.range);
      const timeStamp = new Date().getTime();
      const range = lastSelection.selection.range;
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

      if (selection) {
        // range.deleteContents();
        range.insertNode(temp);
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

    // const parseJsonToContentEdit = (contents) => {
    //   // TODO :: content 데이터가 있는 경우 화면에 렌더링
    //   for (const property in contents) {
    //     console.log(`${property}: ${contents[property]}`);
    //   }
    //   makeDomNodeTree('div');
    // };
    //
    // const makeDomNodeTree = (node) => {
    //   console.log(node);
    // };

    onMounted(() => {

      history.article[history.index] = element.value.innerHTML;
      history.index++;

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

      // Undo
      window.EventBus.on('emitUndo', () => {
        if (history.index > 0) {
          console.log('on:emitUndo', history.index);
          element.value.innerHTML = history.article[history.index -1];
          history.index--;
        }
        console.log(history);
      });

      // Redo
      window.EventBus.on('emitRedo', () => {
        if (history.article.length > history.index) {
          console.log('on:emitRedo');
          element.value.innerHTML = history.article[history.index];
          history.index++;
        }
        console.log(history);

      });

      // json to element
      window.EventBus.on('emitParseJsonToContent', (jsonData) => {
        console.log('on:emitParseJsonToContent', jsonData);
        // parseJsonToContentEdit(jsonData);
      });

      if (props.contents !== null) {
        // contents json 값을 화면에 파싱
        console.log(props.contents);
        // parseJsonToContentEdit(props.contents);
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
      $event.preventDefault();
      const paste = ($event.clipboardData || window.clipboardData).getData('text/plain');
      document.execCommand('insertText', false, paste);


      // const paste = ($event.clipboardData || window.clipboardData).getData('text');
      // const temp = paste.split(/\n/g);
      //
      // if (!selection.rangeCount) {
      //   return false;
      // }
      //
      // selection.getRangeAt(0).deleteContents();
      //
      // let rows = document.createElement('div');
      //
      // temp.forEach((text) => {
      //   let row = document.createElement('div');
      //   if (text) {
      //     row.innerText = text.toString();
      //   } else {
      //     row.innerHTML = '<br>';
      //   }
      //   rows.appendChild(row);
      // });
      //
      // // TODO :: undo, redo 생각하자
      // // TODO :: insertNode 는 undo, redo 가 안됨, 히스토리를 따로 관리해야 함
      // // TODO :: vuex? 아니면 입력마다 json 포맷으로 히스토리 생성 => json to element 구현 필요함
      // selection.getRangeAt(0).insertNode(rows);
      // $event.preventDefault();
      // currentContent();
    };

    watch(element, (newValue, oldValue) => {
      console.log('watch article lazy', newValue, oldValue);
    })

    return {
      element,
      article,
      update,
      getMousePointPosition,
      focusIn,
      focusOut,
      pasteEvent,
      history,
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
