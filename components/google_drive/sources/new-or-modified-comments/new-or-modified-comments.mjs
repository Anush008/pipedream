// This source processes changes to any files in a user's Google Drive,
// implementing strategy enumerated in the Push Notifications API docs:
// https://developers.google.com/drive/api/v3/push and here:
// https://developers.google.com/drive/api/v3/manage-changes
//
// This source has two interfaces:
//
// 1) The HTTP requests tied to changes in the user's Google Drive
// 2) A timer that runs on regular intervals, renewing the notification channel as needed

import common from "../common-webhook.mjs";
import { GOOGLE_DRIVE_NOTIFICATION_CHANGE } from "../../common/constants.mjs";

export default {
  ...common,
  key: "google_drive-new-or-modified-comments",
  name: "New or Modified Comments (Instant)",
  description:
    "Emit new event when a file comment is created or modified in the selected Drive",
  version: "0.1.7",
  type: "source",
  // Dedupe events based on the "x-goog-message-number" header for the target channel:
  // https://developers.google.com/drive/api/v3/push#making-watch-requests
  dedupe: "unique",
  hooks: {
    async deploy() {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 30);
      const timeString = daysAgo.toISOString();

      const args = this.getListFilesOpts({
        q: `mimeType != "application/vnd.google-apps.folder" and modifiedTime > "${timeString}" and trashed = false`,
        fields: "files",
        pageSize: 5,
      });

      const { files } = await this.googleDrive.listFilesInPage(null, args);

      await this.processChanges(files);
    },
    async activate() {
      await common.hooks.activate.bind(this)();
      this._setInitTime(Date.now());
    },
    async deactivate() {
      await common.hooks.deactivate.bind(this)();
      this._setInitTime(null);
    },
  },
  methods: {
    ...common.methods,
    _getInitTime() {
      return this.db.get("initTime");
    },
    _setInitTime(initTime) {
      this.db.set("initTime", initTime);
    },
    _getLastCommentTimeForFile(fileId) {
      return this.db.get(fileId) || this._getInitTime();
    },
    _updateLastCommentTimeForFile(fileId, commentTime) {
      this.db.set(fileId, commentTime);
    },
    getUpdateTypes() {
      return [
        GOOGLE_DRIVE_NOTIFICATION_CHANGE,
      ];
    },
    generateMeta(data, headers) {
      const {
        id: commentId,
        content: summary,
        modifiedTime: tsString,
      } = data;
      const ts = Date.parse(tsString);
      const eventId = headers && headers["x-goog-message-number"];

      return {
        id: `${commentId}-${eventId || ts}`,
        summary,
        ts,
      };
    },
    getChanges(headers) {
      if (!headers) {
        return {
          change: { },
        };
      }
      return {
        change: {
          state: headers["x-goog-resource-state"],
          resourceURI: headers["x-goog-resource-uri"],
          // Additional details about the changes. Possible values: content,
          // parents, children, permissions.
          changed: headers["x-goog-changed"],
        },
      };
    },
    async processChanges(changedFiles, headers) {
      const changes = this.getChanges(headers);

      for (const file of changedFiles) {
        const lastCommentTimeForFile = this._getLastCommentTimeForFile(file.id);
        let maxModifiedTime = lastCommentTimeForFile;
        const commentsStream = this.googleDrive.listComments(
          file.id,
          lastCommentTimeForFile,
        );

        for await (const comment of commentsStream) {
          const commentTime = Date.parse(comment.modifiedTime);
          if (commentTime <= lastCommentTimeForFile) {
            continue;
          }

          const eventToEmit = {
            comment,
            file,
            ...changes,
          };
          const meta = this.generateMeta(comment, headers);
          this.$emit(eventToEmit, meta);

          maxModifiedTime = Math.max(maxModifiedTime, commentTime);
          this._updateLastCommentTimeForFile(file.id, maxModifiedTime);
        }
      }
    },
  },
};
