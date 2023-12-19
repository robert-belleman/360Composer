/**
 * Constants.ts
 *
 * Description:
 * This file contains constants used in a the VideoEditor Component for defining
 * dimensions, layout configurations, and minimum values related to the timeline
 * and media library components.
 *
 * Constants:
 * - TIMELINE_HEIGHT: The height of the timeline component in pixels.
 * - MEDIA_LIBRARY_WIDTH: The width of the media library component in pixels.
 * - MEDIA_LIBRARY_COLS: The number of columns in the media library grid layout.
 * - TIMELINE_CLIP_HEIGHT: The height of individual video clips in the timeline.
 * - MINIMUM_CLIP_LENGTH: The minimum duration (in seconds) allowed for a video clip.
 * - MAX_UNDO_STATES: The number of states to store for using undo() and redo().
 *
 */

/* UI Settings. */
export const TIMELINE_HEIGHT = 320;
export const MEDIA_LIBRARY_COLS = 2;
export const MEDIA_LIBRARY_IMAGE_WIDTH = 160;
export const MEDIA_LIBRARY_WIDTH =
  MEDIA_LIBRARY_IMAGE_WIDTH * MEDIA_LIBRARY_COLS +
  MEDIA_LIBRARY_COLS * MEDIA_LIBRARY_COLS;
export const TIMELINE_CLIP_HEIGHT = 100;

/* Performance concering settings. */
/* NOTE: if MINIMUM_CLIP_LENGTH < 1, then the length in TimelineLayer.tsx
         should be multiplied by 100. Otherwise the flexGrow attribute will
         be between 0 and 1. */
export const MINIMUM_CLIP_LENGTH = 0.166;
export const CLIP_UNDO_STATES = 10;
