<template>
  <div id="app" class="relative">
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400 relative" role="toolbar">
      <button class="btn-icon" type="button" @click="addIconArticleForm">
        <img src="@/assets/img/img_1.png" class="w-10 h-10" alt="">
      </button>
      <button class="btn-icon" type="button">
        <img src="@/assets/img/img_2.png" class="w-10 h-10" alt="">
      </button>
      <button type="button" @click="outputArticle('innerText')" class="m-2">out innerText</button>
      <button type="button" @click="outputArticle('innerHTML')" class="m-2">out innerHtml</button>
      <button type="button" @click="outputArticle('textContent')" class="m-2">out textContent</button>
      <button type="button" @click="outputArticle('children')" class="m-2">out children</button>
    </div>
    <type-one
        :tag="'div'"
        :editable="editable"
        v-model="article"
        :contents="contents"
        :article-id="articleId"
    ></type-one>
  </div>
</template>

<script>

import TypeOne from '@/components/type-one';
import {defineComponent, ref, onMounted} from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    TypeOne,
  },
  props: {},
  data() {
    return {
      iconList: [
        {type: 'anchor-male-shot', icon: 'img_1.png'},
        {type: 'anchor-female-shot', icon: 'img_2.png'},
      ],
      contents: {},
    };
  },
  emits: [],
  setup() {
    const article = ref();
    const articleId = ref();
    const editable = ref(true);
    const out = ref();

    const outputArticle = (type) => {
      console.log(article.value);
      let output = '';
      if (type !== '' && article.value) {
        output = article.value[type];
      }
      // let tempText = [];
      // let tempIcon = {
      //   position:[],
      //   text:[]
      // };

      console.log(`outputArticle: ${type}`, output);

      if (output !== '') {
        out.value = {
          text: [],
          icon: [],
        };

        const icon = {
          id: '',
          type: '',
          position:[0,0],
          text:[]
        }
        console.log(icon);
        getChildNodesItems(output);

        // output.forEach((node) => {
        // console.log('node', node, 'node.nodeValue', node.nodeValue);
        // console.log('node.firstChild', node.firstChild, 'typeof node.firstChild', typeof node.firstChild);
        // console.log('node.childNodes', node.childNodes);
        // console.log('node.nodeName', node.nodeName);

        // console.log('node.childNodes[0].nodeName', node.childNodes[0].nodeName);
        // console.log('node.childNodes[0].textContent', node.childNodes[0].textContent);

        // if (node.childNodes[0].nodeName === '#text') {
        //   console.log('#text');
        //   tempText.push(node.childNodes[0].textContent);
        // }

        // if (node.childNodes[0].nodeName === '#text') {
        // out.value.text[articleId.value] = [];
        // out.value.text[articleId.value].push(node.childNodes[0].textContent);
        // }

        // if (node.childNodes.)
        // });

      }

      // console.log('tempText', tempText);
      // out.value.text[articleId.value] = tempText;
      console.log(out.value);
    };

    const getChildNodesItems = (nodes, type = 'text') => {
      console.log('getChildNodesItems',type, nodes);
      // if (nodes.childNodes.length > 1) {
      //   // getChildNodesItems(nodes.childNodes)
      // }
      nodes.forEach((node) => {
        if (node.childNodes.length > 0) {
          if (node.parentElement.classList.contains('icon-wrapper') || type === 'icon') {
            getChildNodesItems(node.childNodes, 'icon');
          } else {
            getChildNodesItems(node.childNodes);
          }
        }

        if (type === 'icon') {
          // TODO :: 버튼인경우 제외
          if (node.nodeName === '#text') {
            out.value.icon.position.line = out.value.text.length;
            out.value.icon.text.push(node.textContent);
          } else if (node.nodeName === 'BR') {
            out.value.text.push(/\r\n/);
          }
        } else {
          if (node.nodeName === '#text') {
            // 아이콘 영역인지 아닌지 확인
            // TODO :: 아이콘 영역의 빈값 입력 확인
            out.value.text.push(node.textContent);
          } else if (node.nodeName === 'BR') {
            out.value.text.push(/\r\n/);
          }
        }

      });
    };

    const toggle = () => {
      console.log('toggle');
      editable.value = !editable.value;
    };

    const update = () => {
      console.log('update');
      // article.value = data;
      outputArticle();
    };

    const addIconArticleForm = () => {
      // 아이콘 영역 추가를 위한 eventBus
      window.EventBus.emit('emitAddIconArticleForm', window.getSelection().getRangeAt(0));
    };

    onMounted(() => {
      articleId.value = `article-${new Date().getTime().toString()}`;
    });

    return {
      editable,
      outputArticle,
      toggle,
      update,
      article,
      addIconArticleForm,
      out,
      articleId,
    };
  },
});
</script>

<style>
#app {
  @apply h-screen w-screen bg-blue-100
}

.icon-wrapper {
  @apply relative w-full my-2 bg-black text-white rounded-lg select-none
}
</style>



