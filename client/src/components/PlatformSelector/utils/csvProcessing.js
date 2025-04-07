import Papa from "papaparse";

/**
 * Process CSV with chunking for large files
 * @param {File} file - CSV file to process
 * @param {Object} handler - Platform-specific handler
 * @param {string} accountSource - Selected account source
 * @param {string} objectIdSource - Selected object ID source
 * @param {number} chunkSize - Size of chunks for processing
 * @returns {Promise<Array>} - Promise resolving to transformed data
 */
export const processCSVWithChunking = async (
  file,
  handler,
  accountSource,
  objectIdSource,
  chunkSize = 5000
) => {
  return new Promise((resolve, reject) => {
    const results = [];
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunk: (chunk, parser) => {
        try {
          // Process this chunk of data
          chunk.data.forEach((row) => {
            try {
              const transformed = handler.transformRow(
                row,
                accountSource,
                objectIdSource
              );

              if (transformed) {
                results.push(transformed);
                totalProcessed++;
              } else {
                totalSkipped++;
              }
            } catch (err) {
              console.warn("Error processing row:", err);
              totalErrors++;
              totalSkipped++;
            }
          });

          // Could emit progress events or update state here
          const progress = Math.min(
            100,
            Math.round((parser.streamer.bytesTotal / file.size) * 100)
          );

          // If we had a setProgress function: setProgress(progress);
        } catch (error) {
          console.error("Error processing chunk:", error);
          // Continue processing despite errors in a chunk
        }
      },
      complete: () => {
        console.log(
          `CSV processing complete. Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`
        );
        resolve(results);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        reject(error);
      },
    });
  });
};
