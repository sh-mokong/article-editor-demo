<template class="p-3">
  <div @click="clicked">
    <div class="line-breaker top-bar non-recursive"
         :class="topButtonVisible ? 'show-line':'hidden-line'"
         @mouseenter="showTopButton"
         @mouseleave="hideTopButton"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="break-button top-button" fill="none" viewBox="0 0 24 24"
           stroke="currentColor"
           @click="addNewLineTop"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg
      >
    </div>
    <article
        ref="root"
        :contenteditable="editable"
        class="bg-black text-white rounded-lg flex outline-none p-1"
        :class="[classes, status ? '':'disabled']"
        :icon-type="iconType"
    >
      <div class="inline-block w-28 align-top flex-grow-0 non-recursive" contenteditable="false">
        <img v-if="iconType === 'male'" class="w-14 h-14" src="@/assets/img/img_1.png" alt="">
        <img v-else class="w-14 h-14" src="@/assets/img/img_2.png" alt="">
      </div>

      <div
          v-if="iconType === 'male'"
          class="inline-block bg-white text-black align-top ml-5 p-2 w-10/12 flex-grow"
          :contenteditable="false">
        <div class="description outline-none"
             :contenteditable="editable"
             @keypress="enterKeyEvent"
             ref="description">
        </div>
      </div>
      <div
          class="inline-block w-32 h-auto py-2 align-top ml-2 text-center flex-grow-0 non-recursive"
          contenteditable="false">
        <button
            v-if="iconType === 'male'"
            type="button" class="block border-white text-white border-2 mx-auto m-1 p-1 text-base" @click="toggle">
          edit:{{
            editable
          }}
        </button>
        <button type="button" class="block border-white text-white border-2 mx-auto m-1 p-1 text-base" @click="remove">
          X
        </button>
      </div>
    </article>
    <div class="line-breaker bottom-bar non-recursive"
         :class="bottomButtonVisible ? 'show-line':'hidden-line'"
         @mouseenter="showBottomButton"
         @mouseleave="hideBottomButton"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="break-button bottom-button" fill="none" viewBox="0 0 24 24"
           stroke="currentColor"
           @click="addNewLineBottom">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
  </div>
</template>

<script>
import {defineComponent, onMounted, ref} from 'vue';

export default defineComponent({
  name: 'IconArticleForm',
  props: {
    id: {
      type: String,
      default: '',
    },
    imgLink: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: 'icon form',
    },
    iconType: {
      type: String,
      default: '',
    },
  },
  emits: ['remove'],
  setup(props) {
    const status = ref(true);
    const editable = ref(true);
    const classes = ref();
    const root = ref(null);
    const topButtonVisible = ref(false);
    const bottomButtonVisible = ref(false);
    const description = ref();

    const enterKeyEvent = ($event) => {
      // console.log($event.keyCode, $event.keyCode === 13);
      if ($event.keyCode === 13) {
        console.log($event.target, $event.currentTarget);
        return false;
      }
    };

    const clicked = () => {
      console.log('icon article form clicked!!! ');
      status.value = !status.value;
      window.EventBus.emit('emitSelectIconArticleForm', {status: false});
    };

    const toggle = () => {
      editable.value = !editable.value;
      const rows = root.value.querySelectorAll('.description');
      rows.forEach((item) => {
        item.setAttribute('contenteditable', editable.value);
      });
    };

    const remove = () => {
      console.log('remove IconArticleForm', props.id);
      window.EventBus.emit('emitRemoveIconArticleForm', props.id);

    };

    const addNewLineTop = () => {
      // TODO :: 아이콘 영역 윗줄에 아무것도 없을 경우에만 윗줄에 새로운 줄 생성
      if (topButtonVisible.value) {
        window.EventBus.emit('emitAddNewLineTop');
      }
    };

    const addNewLineBottom = () => {
      // TODO :: 아이콘 영역 아랫줄에 아무것도 없을 경우에만 아랫줄에 새로운 로우 생성
      if (bottomButtonVisible.value) {
        window.EventBus.emit('emitAddNewLineBottom');
      }
    };

    const showTopButton = () => {
      // TODO :: 아이콘 영역 윗줄에 아무것도 없을 경우에만
      // console.log('showTopButton');
      topButtonVisible.value = true;
    };

    const hideTopButton = () => {
      // console.log('hideTopButton');
      topButtonVisible.value = false;
    };

    const showBottomButton = () => {
      // TODO :: 아이콘 영역 아랫줄에 아무것도 없을 경우에만
      // console.log('showBottomButton');
      bottomButtonVisible.value = true;
    };

    const hideBottomButton = () => {
      // console.log('hideBottomButton');
      bottomButtonVisible.value = false;
    };

    onMounted(() => {
      description.value.innerText = props.message;
    });

    return {
      enterKeyEvent,
      clicked,
      status,
      classes,
      editable,
      toggle,
      root,
      remove,
      topButtonVisible,
      bottomButtonVisible,
      showTopButton,
      showBottomButton,
      hideTopButton,
      hideBottomButton,
      addNewLineTop,
      addNewLineBottom,
      description,
    };
  },

});
</script>

<style scoped>
.line-breaker {
  @apply absolute left-0 right-0 h-2 opacity-0;
  margin: 0 -0.5rem;
  border-style: dashed;
  border-color: red;
}

.top-bar {
  top: -0.5rem;
  border-top-width: 1px;

}

.bottom-bar {
  bottom: -0.5rem;
  border-bottom-width: 1px;
}

.break-button {
  @apply text-black mx-auto my-0 h-10 w-10 ;
  fill: white;
}

.top-button {
  margin-top: -18px
}

.bottom-button {
  margin-top: -10px
}

.show-line {
  opacity: 1;
}

.show-line::v-deep(.break-button) {
  @apply cursor-pointer
}

.hidden-line {
  opacity: 0;
}

.separator {
  font-size: 0;
  height: 0;
}
</style>
