/**
 * Bluesky platform handler
 */
export const blueskyHandler = {
  getAccountSourceOptions: () => [
    {
      value: "username_bluesky_account_source",
      label:
        "For BlueSky, 'username' is automatically selected as the account source.",
    },
  ],
  getObjectIdSourceOptions: () => [
    {
      value: "text_bluesky",
      label:
        "For BlueSky, 'text' (post content) is automatically selected as the Object ID.",
    },
  ],
  transformRow: (row, accountSource, objectIdSource) => {
    const accountIdVal = row.username;
    const contentIdVal = row.id;
    const timestampVal = row.date;
    const objectIdSourceVal = row.text;

    const isValid = Boolean(
      accountIdVal && contentIdVal && timestampVal && objectIdSourceVal
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
