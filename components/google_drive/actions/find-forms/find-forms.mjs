import googleDrive from "../../google_drive.app.mjs";
import { getListFilesOpts } from "../../common/utils.mjs";
import searchQuery from "../../common/searchQuery.mjs";

export default {
  key: "google_drive-find-forms",
  name: "Find Forms",
  description: "List Google Form documents or search for a Form by name. [See the documentation](https://developers.google.com/drive/api/v3/search-files) for more information",
  version: "0.0.4",
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
      content: "If no query or search name is specified, all forms in the selected drive/folder will be returned.",
    },
    ...searchQuery.props,
  },
  methods: searchQuery.methods,
  async run({ $ }) {
    const q = this.getQuery("form", this.folderId);
    const opts = getListFilesOpts(this.drive, {
      q,
    });
    const files = (await this.googleDrive.listFilesInPage(null, opts)).files;
    $.export("$summary", `Successfully found ${files.length} form(s)`);
    return files.map((file) => ({
      ...file,
      url: `https://docs.google.com/forms/d/${file.id}`,
    }));
  },
};
