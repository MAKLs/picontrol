<template>
  <div
    class="tile is-child box notification"
    :class="`is-${service.name.toLowerCase()}`"
  >
    <div class="columns is-variable is-6 is-vcentered is-centered is-mobile">
      <div class="column is-half service">
        <p class="subtitle">{{ service.name }}</p>
      </div>
      <div class="column is-one-quarter">
        <b-switch
          v-model="isBlocked"
          :type="'is-dark'"
          size="is-medium"
          :rounded="true"
        >
        </b-switch>
      </div>
      <div class="column is-one-quarter">
        <b-icon
          :class="{ blink: shouldBlink }"
          pack="fas"
          :icon="isBlocked ? 'angry' : 'laugh-beam'"
          size="is-medium"
        ></b-icon>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-console */
import piholeMixin from "@/mixins/pihole.js";

export default {
  name: "service",
  mixins: [piholeMixin],
  created() {
    this.previousBlock = this.isBlocked;
  },
  props: {
    service: {
      type: Object,
      required: false,
      default() {
        return {
          name: "hulu",
          domains: ["not.a.domain"]
        };
      }
    },
    whitelist: Array,
    blacklist: Array
  },
  data() {
    return {
      previousBlock: false
    };
  },
  computed: {
    toggleMessage() {
      return `Toggled to ${this.isBlocked ? "blocked" : "unblocked"}`;
    },
    serviceName() {
      const wordDelim = " ";
      return this.service.name
        .split(wordDelim)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(wordDelim);
    },
    shouldBlink() {
      return this.isBlocked !== this.previousBlock;
    },
    isBlocked: {
      get() {
        let blocked = false;
        this.service.domains.forEach(domain => {
          if (this.blacklist.includes(domain)) {
            blocked = true;
          }
        });
        return blocked;
      },

      set(value) {
        this.previousBlock = this.isBlocked;
        this.$emit("toggle:start");
        const list = value ? "black" : "white";
        const domain = this.service.domains.join(" ");
        this.addToList(list, domain).then(() => {
          // Let the control panel know we need to refresh the lists
          this.$emit("toggle:done");
        });
      }
    }
  }
};
</script>

<style scoped>
.box {
  text-align: center;
}

.columns > .column.service > .subtitle {
  font-size: 1.35em;
  font-weight: bolder;
}

.blink {
  animation: bounce 0.75s;
}

@keyframes bounce {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(0.25);
  }
  75% {
    transform: scale(1.7);
  }
  100% {
    transform: scale(1);
  }
}
</style>
