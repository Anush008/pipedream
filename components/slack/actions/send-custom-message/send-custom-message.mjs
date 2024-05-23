import common from "../common/send-message.mjs";

export default {
  ...common,
  key: "slack-send-custom-message",
  name: "Send a Custom Message",
  description: "Customize advanced setttings and send a message to a channel, group or user. See [postMessage](https://api.slack.com/methods/chat.postMessage) or [scheduleMessage](https://api.slack.com/methods/chat.scheduleMessage) docs here",
  version: "0.2.19",
  type: "action",
  props: {
    slack: common.props.slack,
    conversation: {
      propDefinition: [
        common.props.slack,
        "conversation",
      ],
    },
    text: {
      propDefinition: [
        common.props.slack,
        "text",
      ],
    },
    mrkdwn: {
      propDefinition: [
        common.props.slack,
        "mrkdwn",
      ],
    },
    attachments: {
      propDefinition: [
        common.props.slack,
        "attachments",
      ],
    },
    parse: {
      propDefinition: [
        common.props.slack,
        "parse",
      ],
    },
    blocks: {
      propDefinition: [
        common.props.slack,
        "blocks",
      ],
    },
    link_names: {
      propDefinition: [
        common.props.slack,
        "link_names",
      ],
    },
    reply_broadcast: {
      propDefinition: [
        common.props.slack,
        "reply_broadcast",
      ],
    },
    thread_ts: {
      propDefinition: [
        common.props.slack,
        "messageTs",
        (c) => ({
          channel: c.conversation,
        }),
      ],
      description: "Provide another message's `ts` value to make this message a reply (e.g., if triggering on new Slack messages, enter `{{event.ts}}`). Avoid using a reply's `ts` value; use its parent instead.",
    },
    ...common.props,
  },
};
