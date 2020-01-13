import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import appConfig from "./config";
import Buefy from "buefy";

// Register Buefy
Vue.use(Buefy);

// Register configuration
Vue.prototype.$config = appConfig;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
