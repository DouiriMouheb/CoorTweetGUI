/**
 * Facebook platform handler
 */
export const facebookHandler = {
  getAccountSourceOptions: () => [
    {
      value: "post_owner_facebook_account_source",
      label: "Post Owner (post_owner.id, post_owner.name)",
    },
    {
      value: "surface_account_source",
      label: "Surface (surface.id, surface.name)",
    },
  ],

  getObjectIdSourceOptions: () => [
    {
      value: "text_facebook",
      label: "Text content (text)",
    },
    {
      value: "link_attachment.link_facebook",
      label: "Link attachment (link_attachment.link)",
    },
  ],

  transformRow: (row, accountSource, objectIdSource) => {
    const idField = accountSource.includes("post_owner")
      ? "post_owner.id"
      : "surface.id";
    const nameField = accountSource.includes("post_owner")
      ? "post_owner.name"
      : "surface.name";

    const accountIdVal = row[idField];
    const contentIdVal = row.id;
    const timestampVal = row.creation_time;
    let objectIdSourceVal;

    if (objectIdSource.includes("text")) {
      objectIdSourceVal = row.text;
    } else if (objectIdSource.includes("link_attachment")) {
      objectIdSourceVal = row["link_attachment.link"];
    }

    const isValid = Boolean(
      accountIdVal &&
        row[nameField] &&
        contentIdVal &&
        timestampVal &&
        objectIdSourceVal
    );

    if (!isValid) return null;

    // Parse timestamp
    let timestamp = timestampVal;
    if (isNaN(timestampVal)) {
      timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
    }

    return {
      account_id: String(accountIdVal).trim(),
      content_id: String(contentIdVal).trim(),
      object_id: String(objectIdSourceVal || "").trim(),
      timestamp_share: timestamp,
    };
  },
};
