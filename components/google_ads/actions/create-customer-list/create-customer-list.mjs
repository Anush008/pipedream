import googleAds from "../../google_ads.app.mjs";

export default {
  key: "google_ads-create-customer-list",
  name: "Create Customer List",
  description: "Create a new customer list in Google Ads. [See the documentation](https://developers.google.com/google-ads/api/rest/reference/rest/v16/UserList)",
  version: "0.0.1",
  type: "action",
  props: {
    googleAds,
    accountId: {
      propDefinition: [
        googleAds,
        "accountId",
      ],
    },
    customerClientId: {
      propDefinition: [
        googleAds,
        "customerClientId",
      ],
    },
    name: {
      type: "string",
      label: "Name",
      description: "The name of the customer list.",
    },
    description: {
      type: "string",
      label: "Description",
      description: "Description of the customer list.",
      optional: true,
    },
    additionalFields: {
      type: "object",
      label: "Additional Fields",
      description:
        "Additional fields and values for the customer list. [See the documentation](https://developers.google.com/google-ads/api/rest/reference/rest/v16/UserList) for available fields. Values will be parsed as JSON where applicable.",
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.googleAds.createUserList({
      $,
    });

    $.export("$summary", `Created customer list with ID ${response.id}`);
    return response;
  },
};
