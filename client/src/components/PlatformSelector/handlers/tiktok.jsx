/**
 * TIKTOK platform handler
 */
export const tiktokHandler = {
  getAccountSourceOptions: () => [
    {
      value: "name_region_tiktok_account_source",
      label:
        "For TikTok, 'author' (Name + Region) is automatically selected as the account source.",
    },
  ],
  getObjectIdSourceOptions: () => [
    {
      value: "video_description_tiktok",
      label: "Video Description",
    },
    {
      value: "video_to_text_tiktok",
      label: "Voice To Text",
    },
    {
      value: "video_url_tiktok",
      label: "Video URL",
    },
    {
      value: "video_effect_ids_tiktok",
      label: "Effect IDs",
    },
    {
      value: "video_music_id_tiktok",
      label: "Music Id",
    },
    {
      value: "video_hashtag_names_tiktok",
      label: "Hashtag Names",
    },
  ],
  transformRow: (row, accountSource, objectIdSource) => {
    const accountIdVal = row.author_name;
    const contentIdVal = row.video_id;
    const timestampVal = row.create_time;

    // Map objectIdSource to the correct field
    const tiktokFieldMap = {
      video_description_tiktok: "video_description",
      video_to_text_tiktok: "voice_to_text",
      video_url_tiktok: "video_url",
      video_effect_ids_tiktok: "effect_ids",
      video_music_id_tiktok: "music_id",
      video_hashtag_names_tiktok: "hashtag_names",
    };

    const fieldToUse = tiktokFieldMap[objectIdSource];
    const objectIdSourceVal = fieldToUse ? row[fieldToUse] : "";

    const requiredFields = [
      "video_description_tiktok",
      "video_to_text_tiktok",
      "video_url_tiktok",
      "video_hashtag_names_tiktok",
    ];

    const isRequired = requiredFields.includes(objectIdSource);
    const isValid = Boolean(
      accountIdVal &&
        contentIdVal &&
        timestampVal &&
        (isRequired
          ? Boolean(objectIdSourceVal)
          : objectIdSourceVal !== undefined)
    );

    if (!isValid) return null;

    // Parse timestamp
    let timestamp = timestampVal;
    if (isNaN(timestampVal)) {
      timestamp = Math.floor(new Date(timestampVal).getTime() / 1000);
    }

    return {
      account_id: `${row.author_name || ""} (${
        row.region_code || "unknown"
      })`.trim(),
      content_id: String(contentIdVal).trim(),
      object_id: String(objectIdSourceVal || "").trim(),
      timestamp_share: timestamp,
    };
  },
};
