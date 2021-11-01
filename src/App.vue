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
        // TODO :: DB 에서 가져오기
        {type: 'anchor-male-shot', icon: 'img_1.png'},
        {type: 'anchor-female-shot', icon: 'img_2.png'},
      ],
    };
  },
  setup() {
    const article = ref({});
    const articleId = ref();
    const editable = ref(true);
    const out = ref({
      text: {},
      icon: {},
    });
    const lineNumber = ref(0);
    // TODO :: 폰트 목록 정의 필요
    const fontFamily = ref('font-sans');
    const iconAddEnable = ref(true);
    const history = {stack: [], index: 0, max: 30};
    const contents = ref({});
    // eslint-disable-next-line no-unused-vars
    let tempParentNode = null;

    const outputArticle = (type) => {
      // 기사 내용 내보내기
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
      // 아이콘 영역 정보 추출
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
      // 추출한 정보를 프린트
      // TODO :: 정리 필요함
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
      // undo, redo 를 위한 history 생성
      const stack = JSON.stringify(outputArticle('history'));
      // console.log(stack, history.stack[history.index - 1], stack === history.stack[history.index - 1]);

      // 되돌리기 중간에 수정내용이 있는 경우 히스토리를 제거한다
      history.stack = history.stack.splice(0, history.index);


      // TODO :: max length 적용하기
      // TODO :: 커서 위치 뽑아서 커서위치 표시

      if (stack !== history.stack[history.index - 1]) {
        history.stack[history.index] = stack;
        history.index++;
      }
    };

    const undo = () => {
      if (history.index <= 0) {
        return;
      }

      // TODO:: 이렇게 하면 undo 누를 때 마다 히스토리 생성?
      if (history.stack.length === history.index) {
        makeHistory();
        history.index--;
      }

      history.index--;
      contents.value = JSON.parse(history.stack[history.index]);
      console.log(JSON.parse(history.stack[history.index]));
    };

    const redo = () => {
      console.log('emit redo');

      if ((history.index + 1) === history.stack.length) {
        return;
      }

      history.index++;

      contents.value = JSON.parse(history.stack[history.index]);
      console.log(JSON.parse(history.stack[history.index]));
    };

    onMounted(() => {
      // 에디터 마운트 시 기사 아이디 생성 - 타임스탬프
      // TODO :: 별도로 정해진 아이디 생성 규칙이 있다면 그걸로 변경
      articleId.value = `article-${new Date().getTime().toString()}`;
    });

    return {
      editable,
      outputArticle,
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
      contents,
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



