import qntrl from "../../qntrl.app.mjs";
import common from "../common/common.mjs";
import sampleEmit from "./test-event.mjs";

export default {
  ...common,
  key: "google_ads-new-lead-form-entry",
  name: "New Lead Form Entry",
  description: "Emit new event for new leads on a Lead Form. [See the documentation](https://developers.google.com/google-ads/api/fields/v16/lead_form_submission_data)",
  version: "0.0.1",
  type: "source",
  dedupe: "unique",
  sampleEmit,
  props: {
    ...common.props,
    leadFormId: {
      propDefinition: [
        qntrl,
        "leadFormId",
        (({
          accountId, customerClientId,
        }) => ({
          accountId,
          customerClientId,
        })),
      ],
    },
  },
  methods: {
    ...common.methods,
    getSummary() {
      return "New Lead";
    },
    getItems() {
      const {
        accountId, customerClientId, leadFormId,
      } = this;
      return this.googleAds.getLeadFormData({
        accountId,
        customerClientId,
        leadFormId,
      });
    },
    getItemId({ id }) {
      return id;
    },
  },
};
