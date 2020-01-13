import axios from "axios";
import https from "https";

const piholeMixin = {
  created() {
    this.client = axios.create({
      responseType: "json",
      httpsAgent: new https.Agent({
        keepAlive: true,
        rejectUnauthorized: false
      })
    });
  },
  data() {
    return {
      client: null
    };
  },
  methods: {
    showToast({
      type = "is-dark",
      message,
      position = "is-bottom",
      queue = true,
      duration = 2000,
      error = null
    }) {
      if (error !== null) {
        // eslint-disable-next-line no-console
        console.log(error);
        message = `${message}: ${error}`;
      }
      this.$buefy.toast.open({
        type: type,
        message: message,
        position: position,
        queue: queue,
        duration: duration
      });
    },
    async getList(list) {
      // If not passed, then retrieve all lists.
      // Else must be blacklist or white list
      let payload;
      switch (list) {
        case "white":
        case "black":
          payload = { list: list };
          break;
        case undefined:
          payload = {};
          list = "all listst"; // in case we need to display error later
          break;
        default:
          throw Error(
            `List must be white, black or omitte. Received "${list}"`
          );
      }

      return this.client
        .get("/lists", {
          params: payload
        })
        .then(response => {
          if (response.data.errors.length > 0) {
            throw Error(response.data.errors.toString());
          }
          return response.data;
        });
    },
    async addToList(list, domain) {
      // If no domain was passed, no reason to make a request
      if (domain === "") {
        this.showToast({
          type: "is-warning",
          message: `No domains to add to ${list}list`
        });
        return;
      }

      let payload = {
        list: list,
        domain: domain
      };

      return this.client
        .post("/lists", payload)
        .then(response => {
          // eslint-disable-next-line no-console
          console.log(response.data);
          return response;
        })
        .catch(error => {
          this.showToast({
            type: "is-danger",
            message: `Failed to add ${domain} to ${list}list`,
            error: error
          });
          return {};
        });
    }
  }
};

export default piholeMixin;
