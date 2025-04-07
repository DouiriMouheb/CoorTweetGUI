/**
 * Instagram platform handler
 */
export const instagramHandler = {
  getAccountSourceOptions: () => [
    {
      value: "post_owner_instagram_account_source",
      label: "Post Owner (post_owner.id, post_owner.name)",
    },
  ],
  getObjectIdSourceOptions: () => [
    {
      value: "text_instagram",
      label: "Text content (text)",
    },
  ],
  transformRow: (row, accountSource, objectIdSource) => {
    // Similar implementation to Facebook
    const idField = "post_owner.id";
    const nameField = "post_owner.name";

    const accountIdVal = row[idField];
    const contentIdVal = row.id;
    const timestampVal = row.creation_time;
    const objectIdSourceVal = row.text;

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
