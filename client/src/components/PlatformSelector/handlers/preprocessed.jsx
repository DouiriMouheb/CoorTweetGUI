/**
 * PREPROCESSED platform handler
 */
export const preprocessedHandler = {
  getAccountSourceOptions: () => [],
  getObjectIdSourceOptions: () => [],
  transformRow: (row) => {
    // Already in the correct format, just validate
    const accountIdVal = row.account_id;
    const contentIdVal = row.content_id;
    const objectIdSourceVal = row.object_id;
    const timestampVal = row.timestamp_share;

    const isValid = Boolean(
      accountIdVal && contentIdVal && objectIdSourceVal && timestampVal
    );

    if (!isValid) return null;

    return {
      account_id: String(accountIdVal).trim(),
      content_id: String(contentIdVal).trim(),
      object_id: String(objectIdSourceVal || "").trim(),
      timestamp_share: timestampVal,
    };
  },
};
