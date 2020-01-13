<template>
  <div id="app">
    <ControlPanel />
  </div>
</template>

<script>
import ControlPanel from "@/components/ControlPanel.vue";

export default {
  name: "app",
  components: {
    ControlPanel
  },
  created() {
    document.addEventListener("swUpdated", this.displayUpdate, { once: true });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload();
    });
  },
  data() {
    return {
      refreshing: false,
      registration: null
    };
  },
  methods: {
    displayUpdate(e) {
      this.registration = e.detail;
      this.$buefy.snackbar.open({
        message: "An update is available",
        type: "is-raspberry",
        actionText: "Update",
        indefinite: true,
        queue: false,
        onAction: () => {
          this.applyUpdate();
        }
      });
    },
    applyUpdate() {
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      this.registration.waiting.postMessage("skipWaiting");
      this.$buefy.toast.open({
        position: "is-bottom",
        type: "is-success",
        message: "Updated!"
      });
    }
  }
};
</script>

<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Set your colors
$primary: #8c67ef;
$primary-invert: findColorInvert($primary);
$raspberry: #e30b5c;
$raspberry-invert: findColorInvert($raspberry);
$twitter: #4099ff;
$twitter-invert: findColorInvert($twitter);
$hulu: #5c9730;
$hulu-invert: findColorInvert($hulu);
$facebook: #3b5998;
$facebook-invert: findColorInvert($facebook);
$snapchat: #fffc00;
$snapchat-invert: findColorInvert($snapchat);
$eff: #ec1e1e;
$eff-invert: findColorInvert($eff);
$cbs: #0092f2;
$cbs-invert: findColorInvert($cbs);

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
  "white": (
    $white,
    $black
  ),
  "black": (
    $black,
    $white
  ),
  "light": (
    $light,
    $light-invert
  ),
  "dark": (
    $dark,
    $dark-invert
  ),
  "primary": (
    $primary,
    $primary-invert
  ),
  "raspberry": (
    $raspberry,
    $raspberry-invert
  ),
  "info": (
    $info,
    $info-invert
  ),
  "success": (
    $success,
    $success-invert
  ),
  "warning": (
    $warning,
    $warning-invert
  ),
  "danger": (
    $danger,
    $danger-invert
  ),
  "twitter": (
    $twitter,
    $twitter-invert
  ),
  "hulu": (
    $hulu,
    $hulu-invert
  ),
  "facebook": (
    $facebook,
    $facebook-invert
  ),
  "snapchat": (
    $snapchat,
    $snapchat-invert
  ),
  "eff": (
    $eff,
    $eff-invert
  ),
  "cbs": (
    $cbs,
    $cbs-invert
  )
);

$box-shadow: 0 0.5em 1em -0.125em rgba($black, 0.2),
  0 0px 0 1px rgba($black, 0.02);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Snackbar
$snackbar-background-color: $black;
$snackbar-color: $white;

$body-background-color: $white;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

// body {
//   position: fixed;
//   width: 100%;
//   top: 0px;
//   left: 0px;
//   height: 100%;
//   background-color: $dark;
// }
</style>
