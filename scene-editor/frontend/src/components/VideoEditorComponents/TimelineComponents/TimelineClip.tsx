/**
 * TimelineClip.tsx
 *
 * Description:
 * This module describes the TimelineClip Component of the Timeline.
 * This file mostly focuses on the rendering of a single clip.
 *
 * TODO: implement drag and drop for user experience.
 *
 */

import React, { useReducer } from "react";

import { Box } from "@mui/material";

import { TIMELINE_CLIP_HEIGHT } from "../Constants";

import { Clip, thumbnailUrl } from "../ClipsContext";

type TimelineClipProps = {
  clip: Clip;
  visibleLength: number;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ clip, visibleLength }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleClick = (clip: Clip) => {
    clip.selected = !clip.selected;
    forceUpdate(); // Force update to see color change immediately.
  };

  return (
    <Box
      boxSizing={"border-box"}
      height={TIMELINE_CLIP_HEIGHT}
      flexGrow={visibleLength}
      flexBasis={0}
    >
      <Box
        width={1}
        height={1}
        boxSizing={"border-box"}
        border={3}
        onClick={() => handleClick(clip)}
        sx={{
          background: `url(${thumbnailUrl(clip)})`,
          backgroundRepeat: "repeat",
          backgroundSize: "contain",
          border: 4,
          borderRadius: 2,
          borderColor: clip.selected ? "LightGreen" : "transparent",
        }}
      ></Box>
    </Box>
  );
};

export default TimelineClip;
