import {createApp} from 'vue';
import './assets/tailwind.css';
import './assets/common.css';
import App from "@/App.vue";
import mitt, {Emitter} from 'mitt';

declare global {
    interface Window {
        EventBus: Emitter<any>;
    }
}

window.EventBus = mitt();

const app = createApp(App);
app.mount('#app');
