<template>
  <article
      ref="root"
      :contenteditable="editable"
      class="bg-black text-white rounded-lg flex"
      :class="[classes, status ? '':'disabled']"
      @click="clicked">
    <div class="inline-block inline-block align-top flex-grow-0" contenteditable="false">
      <img class="w-20 h-20" src="../assets/img/img.png" alt="">
    </div>
    <div
        class="inline-block bg-white text-black align-top ml-5 p-2 w-10/12 flex-grow"
        :contenteditable="false">
      <div
          class="description outline-none"
          :contenteditable="editable"
          @keypress="enterKeyEvent">
        {{ message }}
      </div>
    </div>
    <div class="inline-block w-32 h-auto py-2 align-top ml-2 text-center flex-grow-0" contenteditable="false">
      <button type="button" class="block border-white text-white border-2 mx-auto p-1" @click="toggle">edit:{{
          editable
        }}
      </button>
      <button type="button" class="block border-white text-white border-2 mx-auto p-1" @click="remove"> X</button>
    </div>
  </article>
</template>

<script>
import {defineComponent, ref} from 'vue';

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
  },
  emits: ['remove'],
  setup(props) {
    const status = ref(true);
    const editable = ref(true);
    const classes = ref();
    const root = ref(null);

    const enterKeyEvent = ($event) => {
      console.log($event.keyCode, $event.keyCode === 13);
      if ($event.keyCode === 13) {
        console.log($event.target, $event.currentTarget);
        // document.execCommand('insertBrOnReturn', false, true);
        // document.execCommand("defaultParagraphSeparator", false, "br");
        return false;
      }
    };


    const clicked = () => {
      status.value = !status.value;
    };

    const toggle = () => {
      editable.value = !editable.value;
      const rows = root.value.querySelectorAll('.description');
      rows.forEach((item, index) => {
        console.log(item, index);
        item.setAttribute('contenteditable', editable.value);
      });
    };

    const remove = () => {
      // document.getElementById(props.id).remove();
      console.log('remove IconArticleForm', props.id);
      window.EventBus.emit('emitRemoveIconArticleForm', props.id);

    };

    return {
      enterKeyEvent,
      clicked,
      status,
      classes,
      editable,
      toggle,
      root,
      remove,
    };
  },

});
</script>

<style scoped>

</style>
