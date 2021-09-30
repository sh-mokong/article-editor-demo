<template>
  <div id="app" class="relative">
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400 relative p-2" role="toolbar">
      <button class="btn-icon" type="button" @click="addIconArticleForm('male')">
        <img src="@/assets/img/img_1.png" class="w-10 h-10" alt="">
      </button>
      <button class="btn-icon" type="button" @click="addIconArticleForm('female')">
        <img src="@/assets/img/img_2.png" class="w-10 h-10" alt="">
      </button>
      <button type="button" @click="outputArticle('json')" class="m-2">output JSON</button>
      <button type="button" @click="outputArticle('text')" class="m-2">output Text</button>
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
    const articleData = ref();
    const editable = ref(true);
    const out = ref();
    const lineNumber = ref(0);
    const tempParentNode = ref();

    const outputArticle = (type) => {
      // console.log(article.value);
      let output = '';
      if (type !== '' && article.value) {
        output = article.value.children;
      }
      // console.log(`outputArticle: ${type}`, output);

      // 초기화
      if (output !== '') {
        out.value = {
          text: {},
          icon: {},
        };
        tempParentNode.value = '';
        lineNumber.value = 0;

        getExtractArticleText(output);
      }
      printEditor(out.value, type);
      // console.log(out.value);
    };

    const getExtractArticleText = (nodes) => {
      // console.log('getExtractArticleText', nodes);

      nodes.forEach((node) => {
        /**
         * 화면에서 한 라인의 기준은 div
         * 붙여넣기 하다보면 보이는것으론 똑같지만 dom tree 상으로는 div 가 중첩이 될 수 있음
         * 자식 node 중에 element 가 없다면 tree 구조의 끝을 의미
         * node 객체의 의 끝은 #text 이거나 br
         */
        if (node.nodeName.toUpperCase() !== 'DIV') {
          if (node.parentNode.nodeName.toUpperCase() === 'DIV') {
            if (tempParentNode.value?.outerText !== node.parentNode.outerText) {
              tempParentNode.value = nodes[0].parentNode;
              lineNumber.value++;
            }
          }
        }

        /**
         * 최하위 자식노드까지 재귀호출로 접근한다
         * 아이콘 영역에서 non-recursive 영역은 제외
         */
        if (node.childNodes.length > 0 && !node.classList?.contains('non-recursive')) {
          if (node.classList?.contains('icon-wrapper')) {
            // 아이콘 영역이 나오면 해당 아이콘의 정보를 생성
            if (!out.value.icon[node.id]) {
              out.value.icon[node.id] = {
                iconType: '',
                text: '',
                position: {line: 0, index: 0},
              };
            }
            out.value.icon[node.id].iconType = node.dataset.iconType;

            // 아이콘 영역은 별도의 함수에서 처리
            getIconItemsInformation(nodes);
          } else {
            getExtractArticleText(node.childNodes);
          }
        }

        if (node.nodeName.toUpperCase() === '#TEXT' && node.textContent !== '') {
          // 기존 라인에 값이 있다면 해당 텍스트 이후로 추가
          out.value.text[lineNumber.value] = out.value.text[lineNumber.value] ?
              out.value.text[lineNumber.value] + node.textContent :
              node.textContent;
        } else if (node.nodeName.toUpperCase() === 'BR') {
          out.value.text[lineNumber.value] = out.value.text[lineNumber.value] ?
              out.value.text[lineNumber.value] + '\n' :
              '\n';
        }
      });
    };

    const getIconItemsInformation = (nodes) => {
      // console.log('getIconItemsInformation', nodes);

      nodes.forEach((node, index) => {
        if (!node.classList?.contains('non-recursive')) {
          if (node.classList?.contains('icon-wrapper')) {
            if (index === 0) {
              out.value.icon[node.id].position.index
              lineNumber.value++
            }
            if (index > 0) {
              if (out.value.text[lineNumber.value]) {
                out.value.icon[node.id].position.index = out.value.text[lineNumber.value].length;
              } else {
                out.value.icon[node.id].position.index = 0;
              }
            }
            const description = node.getElementsByClassName('description');
            out.value.icon[node.id].text = description[0]?.outerText;
            out.value.icon[node.id].position.line = lineNumber.value;
          }
        }
      });
    };

    const printEditor = (output, type) => {
      if (type === 'json') {
        console.log(JSON.stringify(output));
      } else if (type === 'text') {
        let text = '';
        for (let textKey in output.text) {
          text += output.text[textKey] + '\r\n';
        }
        console.log('TEXT: ' );
        console.log(text);
        console.log('Icon: ' , output.icon);
      }
    }

    const toggle = () => {
      console.log('toggle');
      editable.value = !editable.value;
    };

    const update = () => {
      console.log('update');
      // article.value = data;
      outputArticle();
    };

    const addIconArticleForm = (type) => {
      // 아이콘 영역 추가를 위한 eventBus
      window.EventBus.emit('emitAddIconArticleForm', {selection: window.getSelection().getRangeAt(0), type: type});
    };

    const loadArticle = () => {
      // json 데이터를 Content로 파싱하는 eventBus
      window.EventBus.emit('emitParseJsonToContent', articleData);
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
      loadArticle,
    };
  },
});
</script>

<style>
#app {
  @apply h-screen w-screen bg-blue-100 text-2xl
}

.icon-wrapper {
  @apply relative w-full my-2 bg-black text-white rounded-lg select-none
}

.type-icon {
  @apply inline-block w-32 h-14
}
</style>



