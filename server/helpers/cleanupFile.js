const fs = require("fs").promises;

/**
 * Deletes a file at the given path if it exists
 * @param {string} filePath - Path to the file to be deleted
 * @returns {Promise<void>}
 */
async function cleanupFile(filePath) {
  if (!filePath) return;

  try {
    await fs.access(filePath); // Check if file exists
    await fs.unlink(filePath);
    console.log(`Successfully deleted uploaded file: ${filePath}`);
  } catch (err) {
    // Only log as error if it's not a "file doesn't exist" error
    if (err.code !== "ENOENT") {
      console.error(`Failed to delete uploaded file: ${err.message}`);
    }
  }
}

module.exports = cleanupFile;
