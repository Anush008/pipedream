import common from "../common/common-flex.mjs";
import app from "../../github.app.mjs";
import constants from "../common/constants.mjs";

const DOCS_LINK =
  "https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads#issues";

export default {
  ...common,
  key: "github-new-or-updated-issue",
  name: "New or Updated Issue",
  description: `Emit new events when an issue is created or updated [See the documentation](${DOCS_LINK})`,
  version: "1.1.0",
  type: "source",
  dedupe: "unique",
  methods: {
    getHttpAdditionalProps() {
      return {
        eventTypes: {
          propDefinition: [
            app,
            "eventTypes",
          ],
          description: `Specify the type(s) of activity that should emit events. [See the documentation](${DOCS_LINK}) for more information on each type. By default, events will be emitted for all activity.`,
          options: constants.EVENT_TYPES_ISSUES,
        },
      };
    },
    getTimerAdditionalProps() {
      return {
        emitUpdates: {
          propDefinition: [
            app,
            "emitUpdates",
          ],
          description:
            "If `false`, events will only be emitted when a new issue is created.",
        },
      };
    },
    getSampleTimerEvent() {
      return {
        testTimer: 456,
      };
    },
    getSampleWebhookEvent() {
      return {
        testWebhook: 123,
      };
    },
    getWebhookEvents() {
      return [
        "issues",
      ];
    },
    checkEventType(type) {
      return !this.eventTypes || this.eventTypes.includes(type);
    },
    async onWebhookTrigger(event) {
      const { body } = event;
      const action = body?.action;
      if (action && this.checkEventType(action)) {
        const ts = Date.now();
        const id = `${action}_${ts}`;
        const summary = `Issue activity (${action}): "${body.pull_request.title}"`;

        this.$emit(body, {
          id,
          summary,
          ts,
        });
      }
    },
    async onTimerTrigger() {
      const {
        emitUpdates, repoFullname,
      } = this;
      const sort = emitUpdates === false
        ? "created"
        : "updated";
      const items = await this.github.getRepositoryLatestIssues({
        repoFullname,
        sort,
      });

      const savedItems = this._getSavedItems();
      const shouldEmit = savedItems.length > 0;

      const tsProp = `${sort}_at`;
      const getFullId = (item) => `${item.id}_${item[tsProp]}`;

      items
        .filter((item) => !savedItems.includes(getFullId(item)))
        .forEach((item) => {
          const id = getFullId(item);

          if (shouldEmit) {
            const ts = new Date(item[tsProp]).valueOf();
            const summary = `Issue ${sort}: "${item.title}"`;

            this.$emit(item, {
              id,
              summary,
              ts,
            });
          }
          savedItems.push(id);
        });
    },
  },
};
