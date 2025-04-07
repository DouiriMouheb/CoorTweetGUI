import { PLATFORMS } from "../constants";
import { facebookHandler } from "./facebook";
import { instagramHandler } from "./instagram";
import { youtubeHandler } from "./youtube";
import { tiktokHandler } from "./tiktok";
import { blueskyHandler } from "./bluesky";
import { telegramHandler } from "./telegram";
import { preprocessedHandler } from "./preprocessed";
import { otherHandler } from "./other";

// Platform-specific handlers mapped by platform type
export const platformHandlers = {
  [PLATFORMS.FACEBOOK]: facebookHandler,
  [PLATFORMS.INSTAGRAM]: instagramHandler,
  [PLATFORMS.YOUTUBE]: youtubeHandler,
  [PLATFORMS.TIKTOK]: tiktokHandler,
  [PLATFORMS.BLUESKY]: blueskyHandler,
  [PLATFORMS.TELEGRAM]: telegramHandler,
  [PLATFORMS.PREPROCESSED]: preprocessedHandler,
  [PLATFORMS.OTHER]: otherHandler,
};
