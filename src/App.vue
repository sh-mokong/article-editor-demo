<template>
  <div id="app" class="relative">
    <div aria-labelledby="아이콘 목록" class="border-2 border-gray-400 relative p-2" role="toolbar">
      <button class="btn-icon" :class="iconAddEnable === false ? 'cursor-not-allowed':''" type="button"
              @click="addIconArticleForm('male')" :disabled="!iconAddEnable">
        <img src="@/assets/img/img_1.png" class="w-10 h-10" alt="">
      </button>
      <button class="btn-icon " :class="iconAddEnable === false ? 'cursor-not-allowed':''" type="button"
              @click="addIconArticleForm('female')" :disabled="!iconAddEnable">
        <img src="@/assets/img/img_2.png" class="w-10 h-10" alt="">
      </button>
      <button type="button" @click="outputArticle('json')" class="m-2">JSON</button>
      <button type="button" @click="outputArticle('text')" class="m-2">Text</button>
      <button type="button" @click="undo" class="m-2">Undo</button>
      <button type="button" @click="redo" class="m-2">Redo</button>
      <select v-model="fontFamily">
        <option value="font-sans">font-sans</option>
        <option value="font-serif">font-serif</option>
        <option value="font-mono">font-mono</option>
      </select>
      <!--      <span class="float-right">예상시간: {{expectedTime}}</span>-->
    </div>
    <type-one
        :tag="'div'"
        v-model="article"
        :contents="contents"
        :article-id="articleId"
        :class="fontFamily"
        @makeHistory="makeHistory"
        @undo="undo"
        @redo="redo"
    ></type-one>
  </div>
</template>

<script>

import TypeOne from '@/components/type-one';
// eslint-disable-next-line no-unused-vars
import {defineComponent, ref, onMounted, watch} from 'vue';

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
    };
  },
  emits: [],
  setup() {
    const article = ref({});
    const articleId = ref();
    const editable = ref(true);
    const out = ref({
      text: {},
      icon: {},
    });
    const lineNumber = ref(0);
    const fontFamily = ref('font-sans');
    const iconAddEnable = ref(true);
    const history = {stack: [], index: 0};
    const contents = ref({});
    // eslint-disable-next-line no-unused-vars
    let tempParentNode = null;

    const outputArticle = (type) => {
      // 초기화
      out.value = {
        text: {},
        icon: {},
      };

      if (type !== '' && article.value.children !== undefined) {
        let output = article.value.children;
        tempParentNode = null;
        lineNumber.value = 0;

        getExtractArticleText(output);
      }
      return printEditor(out.value, type);
    };

    const getExtractArticleText = (nodes) => {
      nodes.forEach((node) => {
        /**
         * 화면에서 한 라인의 기준은 div
         * 붙여넣기 하다보면 보이는것으론 똑같지만 dom tree 상으로는 div 가 중첩이 될 수 있음
         * 자식 node 중에 element 가 없다면 tree 구조의 끝을 의미
         * node 객체의 끝은 #text 이거나 br
         */
        if (node.nodeName.toUpperCase() !== 'DIV') {
          if (node.parentNode.nodeName.toUpperCase() === 'DIV') {
            // if (tempParentNode?.outerText !== node.parentNode.outerText) {
            //   tempParentNode = nodes[0].parentNode;
            // }
            lineNumber.value++;

          }
        }

        /**
         * 최하위 자식노드까지 재귀호출로 접근한다
         * 아이콘 영역에서 non-recursive 영역은 제외
         */
        if (node.childNodes.length > 0 && !node.classList?.contains('non-recursive')) {
          if (node.classList?.contains('icon-wrapper')) {
            // 아이콘 영역
            getIconItemInformation(node, lineNumber.value);
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

    const getIconItemInformation = (nodes, line) => {
      const iconID = nodes.id;
      const iconCode = nodes.dataset.iconType;
      const description = nodes.getElementsByClassName('description');

      // 아이콘의 정보를 생성
      if (!out.value.icon[iconID]) {
        out.value.icon[iconID] = {
          iconType: iconCode,
          text: description[0]?.outerText,
          position: {
            line: line === 0 ? 1 : line,
            index: out.value.text[line] ? out.value.text[line].length : 0,
          },
        };
      }
    };

    const printEditor = (output, type) => {
      if (type === 'json') {
        console.log(JSON.stringify(output));
      } else if (type === 'text') {
        let text = '';
        for (let textKey in output.text) {
          text += output.text[textKey];

          if (output.text[textKey] !== '\n') {
            text += '\n';
          }
        }
        console.log({text: text, icon: JSON.stringify(output.icon)});
      } else if (type === 'history') {
        let text = '';
        for (let textKey in output.text) {
          text += output.text[textKey];

          if (output.text[textKey] !== '\n') {
            text += '\n';
          }
        }
        return {text: text, icon: JSON.stringify(output.icon)};
      }
    };

    const toggle = () => {
      console.log('toggle');
      editable.value = !editable.value;
    };

    const update = () => {
      console.log('update');
      // article.value = data;
    };

    const addIconArticleForm = (type) => {
      // 아이콘 영역 추가를 위한 eventBus
      const selection = window.getSelection();
      console.log(selection.anchorNode);
      window.EventBus.emit('emitAddIconArticleForm', {type: type});
    };

    const expectedTime = () => {
      // 기사 예상 시간
      return 0;
    };

    const makeHistory = () => {
      console.log('make history');
      const stack = JSON.stringify(outputArticle('history'));
      console.log(stack, history.stack[history.index - 1], stack === history.stack[history.index - 1]);
      if (stack !== history.stack[history.index - 1]) {
        history.stack[history.index++] = stack;
        console.log(history);
      }
    };

    const undo = () => {
      if (history.index <= 0) {
        return;
      }

      console.log('emit undo');
      console.log(history);
      // TODO:: 이렇게 하면 undo 누를 때 마다 히스토리 생성?
      if (history.stack.length === history.index) {
        makeHistory();
        history.index--;
      }

      console.log(`history.index : ${history.index}`);
      console.log(history.stack[history.index--]);
      console.log(JSON.parse(history.stack[history.index]));
      contents.value = JSON.parse(history.stack[history.index]);
    };

    const redo = () => {
      if ((history.index + 1) === history.stack.length) {
        return;
      }
      console.log('emit redo');

      console.log(history.stack[history.index++]);
      console.log(JSON.parse(history.stack[history.index]));
      contents.value = JSON.parse(history.stack[history.index]);
    };

    onMounted(() => {
      // 아이콘 영역 선택 이벤트
      // window.EventBus.on('emitSelectIconArticleForm', ({status}) => {
      //   console.log('on:emitSelectIconArticleForm', status);
      //   iconAddEnable.value = status;
      // });

      articleId.value = `article-${new Date().getTime().toString()}`;
      contents.value = {text: `3. Shallow equality
During shallow equality check of objects you get the list of properties (using Object.keys()) of both objects, then check the properties’ values for equality.
Here’s a possible implementation of shallow equality check:

function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}
`, icon: {"icon-1635314010467":{"iconType":"male","text":"Takes a function following the common error-first callback style, i.e. taking an (err, value) => ... callback as the last argument, and returns a version that returns promises.\n","position":{"line":2,"index":158}}}}
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
      expectedTime,
      fontFamily,
      iconAddEnable,
      makeHistory,
      undo,
      redo,
      contents
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



