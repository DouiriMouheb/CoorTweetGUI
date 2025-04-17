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

    const accountId = row[idField];
    const accountName = row[nameField];
    const contentIdVal = row.id;
    const timestampVal = row.creation_time;
    const objectIdSourceVal = row.text;

    const isValid = Boolean(
      accountId &&
        accountName &&
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

    // Format the account_id as "Name (ID)" just like in the Facebook handler
    const formattedAccountId = `${accountName} (${accountId})`;

    return {
      account_id: formattedAccountId,
      content_id: String(contentIdVal).trim(),
      object_id: String(objectIdSourceVal || "").trim(),
      timestamp_share: timestamp,
    };
  },
};

/**
 * Example usage:
 *
 * // Import your CSV data (this is pseudocode)
 * const csvData = loadCSV('instagram_data.csv');
 *
 * // Transform the data
 * const transformedData = csvData
 *   .map(row => instagramHandler.transformRow(
 *     row,
 *     'post_owner_instagram_account_source',
 *     'text_instagram'
 *   ))
 *   .filter(row => row !== null);
 *
 * // Now transformedData contains rows with account_id formatted as "Name (ID)"
 * // Example: "Amazing Ideas (2025862197830911)"
 */
