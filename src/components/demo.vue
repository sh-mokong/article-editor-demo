<template>
  <div>
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400" role="toolbar">
      <button class="btn-icon" type="button" @click="addIconForm">
        <img src="../assets/img/img_1.png" alt="">
      </button>
      <button class="btn-icon" type="button" @click="addIconForm">
        <img src="../assets/img/img_2.png" alt="">
      </button>
    </div>
    <div
        class="editor border-2 border-gray-400"
        contenteditable="true"
        @click="getMousePointPosition($event)"
        v-html="content"
    >
    </div>
  </div>
</template>

<script>
// import {createApp} from 'vue';
// import IconForm from '@/components/IconForm';
// import {defineComponent} from 'vue';
// import IconForm from '@/components/IconForm';

import {onMounted, reactive, ref} from 'vue';
// import IconForm from '@/components/IconForm';

export default {
  name: 'demo',
  components: {
    // IconForm
  },
  props: {
    itemList: {
      type: Array,
      default: () => [],
    },
  },
  setup: function() {
    let selection = reactive({});
    let text = ref({});
    let position = reactive({
      event: '',
      range: 0,
      index: 0,
    });

    selection = document.getSelection();

    const addIconForm = () => {
      // // TODO :: 마우스오버 시 상,하 영역에 줄생성 기능 추가
      let temp = document.createElement('pre');
      temp.classList.add('icon-wrapper','w-full', 'p-3', 'bd-green-300', 'bg-green-200','rounded-lg', 'select-none','cursor-pointer');
      temp.innerHTML = `<div> </div>`;


      if (document.getSelection()) {
        position.range.deleteContents();
        position.range.insertNode(temp);

      }


    };

    const getMousePointPosition = ($event) => {
      position.event = $event;
      position.range = selection.getRangeAt(0);
      position.index = selection.anchorOffset;

      console.log($event, $event.currentTarget, $event.target);
    };

    const enterKeyEvent = ($event) => {
      console.log($event.keyCode, $event.keyCode === 13);
      if ($event.keyCode === 13) {
        console.log($event.target, $event.currentTarget);
        document.execCommand('insertBrOnReturn', false, true);
        return false;
      }
    };

    onMounted(() => {
      console.log('onMounted demo.vue');

    });



    return {
      ...ref(selection),
      text,
      addIconForm,
      getMousePointPosition,
      enterKeyEvent,
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

.editor::v-deep(.icon-wrapper) {
  @apply w-full p-3 bg-black text-white rounded-lg select-none
}
</style>
