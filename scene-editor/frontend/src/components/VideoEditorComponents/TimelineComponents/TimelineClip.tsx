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
      onClick={() => handleClick(clip)}
      sx={{
        background: `url(${thumbnailUrl(clip)})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        height: TIMELINE_CLIP_HEIGHT,
        flexGrow: visibleLength,
        border: 8,
        borderRadius: 4,
        boxSizing: "border-box",
        borderColor: clip.selected ? "BlueViolet" : "transparent",
      }}
    ></Box>
  );
};

export default TimelineClip;
