import googleDrive from "../../google_drive.app.mjs";
import { getListFilesOpts } from "../../common/utils.mjs";

export default {
  key: "google_drive-find-spreadsheets",
  name: "Find Spreadsheets",
  description: "Search for a specific spreadsheet by name. [See the documentation](https://developers.google.com/drive/api/v3/search-files) for more information",
  version: "0.1.3",
  type: "action",
  props: {
    googleDrive,
    drive: {
      propDefinition: [
        googleDrive,
        "watchedDrive",
      ],
      optional: true,
    },
    folderId: {
      propDefinition: [
        googleDrive,
        "folderId",
        (c) => ({
          drive: c.drive,
        }),
      ],
      label: "Parent Folder",
      description: "The ID of the parent folder which contains the file. If not specified, it will list files from the drive's top-level folder.",
      optional: true,
    },
    queryAlert: {
      type: "alert",
      alertType: "info",
      content: "If no query or search name is specified, all spreadsheets in the selected drive/folder will be returned.",
    },
    nameSearchTerm: {
      propDefinition: [
        googleDrive,
        "fileNameSearchTerm",
      ],
    },
    searchQuery: {
      propDefinition: [
        googleDrive,
        "searchQuery",
      ],
      description: "Search for a file with a query. [See the documentation](https://developers.google.com/drive/api/guides/ref-search-terms) for more information. If specified, `Search Name` and `Parent Folder` will be ignored.",
    },
  },
  async run({ $ }) {
    let q = "mimeType = 'application/vnd.google-apps.spreadsheet'";
    if (this.searchQuery) {
      q = this.searchQuery.includes(q)
        ? this.searchQuery
        : `${q} and ${this.searchQuery}`;
    } else {
      if (this.nameSearchTerm) {
        q = `${q} and name contains '${this.nameSearchTerm}'`;
      }
      if (this.folderId) {
        q = `${q} and "${this.folderId}" in parents`;
      }
    }
    const opts = getListFilesOpts(this.drive, {
      q: q.trim(),
    });
    const files = (await this.googleDrive.listFilesInPage(null, opts)).files;
    $.export("$summary", `Successfully found ${files.length} spreadsheet(s)`);
    return files.map((file) => ({
      ...file,
      url: `https://docs.google.com/spreadsheets/d/${file.id}`,
    }));
  },
};
