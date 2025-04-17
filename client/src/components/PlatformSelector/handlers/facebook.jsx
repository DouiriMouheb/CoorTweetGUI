/**
 * Facebook platform handler with fixed account_id formatting
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

    const accountId = row[idField];
    const accountName = row[nameField];
    const contentIdVal = row.id;
    const timestampVal = row.creation_time;
    let objectIdSourceVal;

    if (objectIdSource.includes("text")) {
      objectIdSourceVal = row.text;
    } else if (objectIdSource.includes("link_attachment")) {
      objectIdSourceVal = row["link_attachment.link"];
    }

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

    // Format the account_id as "Name (ID)"
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
 * const csvData = loadCSV('download_1741692148.csv');
 *
 * // Transform the data
 * const transformedData = csvData
 *   .map(row => facebookHandler.transformRow(
 *     row,
 *     'post_owner_facebook_account_source',
 *     'text_facebook'
 *   ))
 *   .filter(row => row !== null);
 *
 * // Now transformedData contains rows with account_id formatted as "Name (ID)"
 * // Example: "Amazing Ideas (2025862197830911)"
 */
