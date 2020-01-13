<template>
  <div class="content">
    <b-loading :is-full-page="true" :active="isLoading"
      ><b-icon
        pack="fas"
        icon="sync-alt"
        size="is-large"
        custom-class="fa-spin"
      >
      </b-icon
    ></b-loading>
    <!-- Title banner -->
    <section class="hero is-bold is-raspberry">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Picontrol
          </h1>
          <h2 class="subtitle">
            Toggle domains
          </h2>
        </div>
      </div>
    </section>
    <!-- Services to toggle block -->
    <div class="container notification" id="services-container">
      <div class="tile is-ancestor">
        <div class="tile is-parent is-vertical">
          <Service
            v-for="service in services"
            :key="service.name"
            :service="service"
            :whitelist="whitelist"
            :blacklist="blacklist"
            @toggle:start="isLoading = true"
            @toggle:done="fetchLists()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Service from "@/components/Service.vue";
import piholeMixin from "@/mixins/pihole.js";

export default {
  name: "control-panel",
  components: { Service },
  mixins: [piholeMixin],
  created() {
    // Fetch current block state of pihole
    this.fetchLists();
  },
  data() {
    return {
      services: this.$config.services,
      whitelist: [],
      blacklist: [],
      isLoading: false
    };
  },
  methods: {
    async fetchLists() {
      this.showToast({
        position: "is-bottom",
        message: "Updating lists"
      });
      this.isLoading = true;
      try {
        const lists = await this.getList();
        this.whitelist = lists.white;
        this.blacklist = lists.black[0];
      } catch (error) {
        this.showToast({
          type: "is-danger",
          message: `Failed to retrieve lists`,
          error: error
        });
      }
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
#services-container {
  background-color: white;
}
</style>
