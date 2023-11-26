/**
 * TimelineClip.tsx
 *
 * Description:
 * This Component describes the appearance of a clip in the timeline.
 *
 */

import React, { useState } from "react";

import { Box } from "@mui/material";

import {
  ActionTypes,
  Clip,
  thumbnailUrl,
  useClipsContext,
} from "../../ClipsContext";
import { TIMELINE_CLIP_HEIGHT } from "../../Constants";

const selectClipAction = (clip: Clip) => ({
  type: ActionTypes.SELECT_CLIP as const,
  payload: { clip: clip },
});

function TimelineClip({ clip }: { clip: Clip }) {
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch } = useClipsContext();

  const toggleSelect = () => {
    dispatch(selectClipAction(clip));
  };

  return (
    <Box
      height={TIMELINE_CLIP_HEIGHT}
      onClick={toggleSelect}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      boxSizing="border-box"
      border={4}
      borderColor={
        clip.selected ? "lightgreen" : isHovered ? "gainsboro" : "transparent"
      }
      borderRadius={2}
      sx={{
        background: `url(${thumbnailUrl(clip)})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
      }}
    ></Box>
  );
}

export default TimelineClip;
