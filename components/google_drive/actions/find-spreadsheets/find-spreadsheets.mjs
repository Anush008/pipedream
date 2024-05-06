import googleDrive from "../../google_drive.app.mjs";
import { getListFilesOpts } from "../../common/utils.mjs";
import searchQuery from "../../common/searchQuery.mjs";

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
    ...searchQuery.props,
  },
  async run({ $ }) {
    const q = this.getQuery("spreadsheet", this.folderId);
    const opts = getListFilesOpts(this.drive, {
      q,
    });
    const files = (await this.googleDrive.listFilesInPage(null, opts)).files;
    $.export("$summary", `Successfully found ${files.length} spreadsheet(s)`);
    return files.map((file) => ({
      ...file,
      url: `https://docs.google.com/spreadsheets/d/${file.id}`,
    }));
  },
};
