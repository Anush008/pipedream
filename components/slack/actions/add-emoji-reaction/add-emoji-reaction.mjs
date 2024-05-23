import slack from "../../slack.app.mjs";

export default {
  key: "slack-add-emoji-reaction",
  name: "Add Emoji Reaction",
  description: "Add an emoji reaction to a message. [See the documentation](https://api.slack.com/methods/reactions.add)",
  version: "0.0.7",
  type: "action",
  props: {
    slack,
    conversation: {
      propDefinition: [
        slack,
        "conversation",
      ],
      description: "Channel where the message to add reaction to was posted.",
    },
    timestamp: {
      propDefinition: [
        slack,
        "messageTs",
        (c) => ({
          channel: c.conversation,
        }),
      ],
      description: "Timestamp of the message to add reaction to.",
    },
    icon_emoji: {
      propDefinition: [
        slack,
        "icon_emoji",
      ],
      description: "Provide an emoji to use as the icon for this reaction. E.g. `fire`",
      optional: false,
    },
  },
  async run() {
    return await this.slack.sdk().reactions.add({
      channel: this.conversation,
      timestamp: this.timestamp,
      name: this.icon_emoji,
    });
  },
};
