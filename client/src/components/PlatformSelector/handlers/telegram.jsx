/**
 * TELEGRAM platform handler
 */
export const telegramHandler = {
  getAccountSourceOptions: () => [
    {
      value: "channel_telegram_account_source",
      label: "Channel (channel_name, channel_id)",
    },
    {
      value: "author_telegram_account_source",
      label: "Author (post_author, sender_id)",
    },
  ],
  getObjectIdSourceOptions: () => [
    {
      value: "message_text_telegram",
      label:
        "For Telegram, 'message_text' is automatically selected as the Object ID source.",
    },
  ],
  transformRow: (row, accountSource, objectIdSource) => {
    let accountIdVal;
    if (accountSource === "channel_telegram_account_source") {
      accountIdVal = `${row.channel_name || ""} ${row.channel_id || ""}`;
    } else {
      accountIdVal = `${row.post_author || ""} ${row.sender_id || ""}`;
    }

    const contentIdVal = row.message_id;
    const timestampVal = row.date;
    const objectIdSourceVal = row.message_text;

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
