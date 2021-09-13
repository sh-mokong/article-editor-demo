<template>
  <article
      ref="root"
      :contenteditable="editable"
      class="bg-black text-white rounded-lg flex flex-row"
      :class="[classes, status ? '':'disabled']"
      @click="clicked">
    <div class="inline-block inline-block align-top flex-grow-0" contenteditable="false">
      <img src="../assets/img/img.png" alt="">
    </div>
    <div
        class="inline-block bg-white text-black align-top ml-2 pl-2 w-10/12 flex-grow"
        :contenteditable="editable">
      <p
          class="description"
          :contenteditable="editable"
          @keypress="enterKeyEvent">
        {{ message }}
      </p>
    </div>
    <div class="inline-block w-32 h-auto py-2 align-top ml-2 flex-grow-0 text-center" contenteditable="false">
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
    // const internalInstance = getCurrentInstance();
    const root = ref(null);

    const enterKeyEvent = ($event) => {
      console.log($event.keyCode, $event.keyCode === 13);
      if ($event.keyCode === 13) {
        console.log($event.target, $event.currentTarget);
        document.execCommand('insertBrOnReturn', false, true);
        // document.execCommand("defaultParagraphSeparator", false, "br");
        // document.execCommand('insertHTML', false, "<br>");
        return false;
      }
    };

    const mouseIn = ($event) => {
      console.log('mouse In', $event);
      classes.value = 'in';
    };

    const mouseOut = ($event) => {
      console.log('mouse Out', $event);
      classes.value = 'out';
    };

    const clicked = () => {
      // console.log('click ', $event);
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
      mouseIn,
      mouseOut,
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
/*.in {*/
/*  background-color: green;*/
/*  color: white*/
/*}*/

/*.disabled {*/
/*  !*@apply bg-red-200 cursor-default*!*/
/*}*/
</style>
