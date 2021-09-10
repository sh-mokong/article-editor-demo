<template>
  <section class="w-full">
    <h1 class="text-center">Article Editor</h1>
    <!-- 툴바 영역   -->
    <section aria-labelledby="기사 제목" role="toolbar">
      <div class="flex flex-col">
        <div class="p-2 flex justify-between  border-2 border-gray-400">
          <div class="w-1/2 px-2">
            <input class="w-full" placeholder="영문 기사 제목 " type="text"/>
          </div>
          <div class="w-1/2 px-2">
            <span>아이콘 영역</span>
          </div>
        </div>
        <div class="p-2 flex justify-between  border-2 border-gray-400">
          <div class="w-1/2 px-2">
            <input class="w-full" placeholder="한글 기사 제목 " type="text"/>
          </div>
          <div class="w-1/2 px-2">
            <span>아이콘 영역</span>
          </div>
        </div>
      </div>
    </section>
    <!-- // 툴바 영역   -->

    <!-- 에디터 영역   -->
    <section>
      <div class="flex flex-row">
        <div class="p-2 flex flex-col flex-grow border-2 border-gray-400">
          <!--  기사작성기 에디터  -->
          <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400" role="toolbar">
            <button class="btn-icon" type="button" @click="addIcon(1)">
              <img src="../assets/img/img_1.png">
            </button>
            <button class="btn-icon" type="button" @click="addIcon(2)">
              <img src="../assets/img/img_2.png">
            </button>
          </div>
          <div
              class="editor border-2 border-gray-400"
              contenteditable="true"
              @click="getMousePointPosition($event)"
              @keydown="enterKeyEvent"
              v-html="content"
          >
          </div>
        </div>
        <div class="p-2 flex-grow-0 w-96 border-2 border-gray-400">
          <!--  기사정보 사이드 패널 -->
        </div>
      </div>
    </section>
    <!-- // 에디터 영역   -->

  </section>
</template>

<script>

import {onMounted, ref, h, reactive, toRef} from 'vue';

export default {
  name: 'Editor',
  components: {
    // Toolbar1,
    // Toolbar2
  },
  props: {
    iconList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props, context) {
    const repositories = ref([]);
    const selectionEditor = document.getSelection();
    const lastSelection = {
      event: '',
      selection: {
        range: 0,
        index: 0,
      },
    };

    const state = reactive({
      TextRef: null,
      content: '',
    });

    const addIcon =
        (type) => {
          makeIconArea(type);
        };

    const getMousePointPosition = ($event) => {
      lastSelection.event = $event;
      lastSelection.selection.range = selectionEditor.getRangeAt(0);
      lastSelection.selection.index = selectionEditor.anchorOffset;

      console.log($event, $event.currentTarget, $event.target);

    };

    const makeIconArea = (type) => {
      console.log(type, lastSelection);

      let src = `@/assets/img/img.png`;
      if (type === 1) {
        src = `@/assets/img/img_1.png`;
      } else if (type === 2) {
        src = `@/assets/img/img_2.png`;
      }
      let temp = document.createElement('pre');
      temp.classList.add('icon','w-full', 'p-3', 'bd-green-300', 'bg-green-200','rounded-lg', 'select-none');
      temp.innerHTML = `<div><img src="${src}"> icon</div>`;
      // temp.onkeydown = enterKeyEvent;
      if (selectionEditor.rangeCount) {
        lastSelection.selection.range.deleteContents();
        lastSelection.selection.range.insertNode(temp);
      }
    };

    const enterKeyEvent = (event) => {
      if (event.keyCode == 13) {
        console.log(event.target, event.currentTarget);
        document.execCommand('insertBrOnReturn', false, true);
        // document.execCommand('insertHTML', false, '<br>');
        return false;
      }
    };

    const createIconArea = (props, context) => {
      console.log(props, context);
      return h(`div`, {onKeydown: enterKeyEvent});
    };

    onMounted(() => {
      console.log('Editor Mounted');
    });

    return {
      props,
      context,
      ...toRef(state),
      addIcon,
      repositories,
      enterKeyEvent,
      getMousePointPosition,
      createIconArea,
    };
  },
};
</script>

<style scoped>
input[type=text] {
  border: 1px solid gray
}

.editor {
  @apply h-full w-full min-h-screen my-4 p-2 bg-blue-50 block
}

.btn-icon {
  @apply w-6 h-6 bg-black text-center align-top;
}

.btn-icon img {
  margin: 0 auto
}
</style>
