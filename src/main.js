import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import cytoscape from "cytoscape";
import dblclick from "cytoscape-dblclick";
import popper from "cytoscape-popper";
import mavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";
import VueCodeMirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(VueCodeMirror)
cytoscape.use(popper);
cytoscape.use(dblclick);

Vue.config.productionTip = false;
Vue.use(mavonEditor)
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
