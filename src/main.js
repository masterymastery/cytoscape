import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import cytoscape from "cytoscape";
import dblclick from "cytoscape-dblclick";
import popper from "cytoscape-popper";

cytoscape.use(popper);
cytoscape.use(dblclick);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
