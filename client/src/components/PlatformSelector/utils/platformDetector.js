import { PLATFORMS } from "../constants";

/**
 * Identifies the data source platform based on CSV headers
 * @param {Array<string>} headers - CSV column headers
 * @returns {string} Platform identifier
 */
export const identifyDataSource = (headers) => {
  if (!headers || headers.length === 0) return PLATFORMS.OTHER;

  // Convert headers to lowercase for case-insensitive matching
  const lowercaseHeaders = headers.map((h) => h.toLowerCase());

  // Check for preprocessed data
  if (
    lowercaseHeaders.includes("account_id") &&
    lowercaseHeaders.includes("content_id") &&
    lowercaseHeaders.includes("object_id") &&
    lowercaseHeaders.includes("timestamp_share")
  ) {
    return PLATFORMS.PREPROCESSED;
  }

  // Check for YouTube
  if (lowercaseHeaders.includes("videoid")) {
    return PLATFORMS.YOUTUBE;
  }

  // Check for TikTok
  if (
    lowercaseHeaders.includes("video_id") &&
    lowercaseHeaders.includes("author_name")
  ) {
    return PLATFORMS.TIKTOK;
  }
  // Check for Meta/Facebook
  if (
    lowercaseHeaders.includes("surface.id") ||
    lowercaseHeaders.includes("surface.name")
  ) {
    return PLATFORMS.FACEBOOK;
  }

  // Check for Instagram
  if (
    lowercaseHeaders.includes("post_owner.id") &&
    lowercaseHeaders.includes("post_owner.name") &&
    !lowercaseHeaders.includes("surface.id") &&
    !lowercaseHeaders.includes("surface.name")
  ) {
    return PLATFORMS.INSTAGRAM;
  }

  // Check for Telegram
  if (
    lowercaseHeaders.includes("channel_id") ||
    lowercaseHeaders.includes("channel_name")
  ) {
    return PLATFORMS.TELEGRAM;
  }

  // Check for BlueSky
  if (
    lowercaseHeaders.includes("username") &&
    lowercaseHeaders.includes("id") &&
    lowercaseHeaders.length <= 4
  ) {
    return PLATFORMS.BLUESKY;
  }
  return PLATFORMS.OTHER;
};
