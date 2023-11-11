/*
Filename: TimelineClip.tsx
Description:
This file describes a single clip on the timeline.
 */

import React, { useReducer, useState } from "react";

import { Box, Button } from "@mui/material";

import Clip from "../Classes/Clip";
import { TIMELINE_CLIP_HEIGHT } from "../Constants";


type TimelineClipProps = {
  clip: Clip;
  duration: number;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ clip, duration }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleClick = (clip: Clip) => {
    clip.toggleSelect();
    forceUpdate();  // Force update to see color change.
  };

  return (
    <Button
      onClick={() => handleClick(clip)}
      sx={{
        background: `url(${clip.getUrl()})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        height: TIMELINE_CLIP_HEIGHT,
        flexGrow: duration,
        border: 8,
        borderRadius: 4,
        boxSizing: "border-box",
        borderColor: clip.selected ? "BlueViolet" : "transparent",
      }}
    ></Button>
  );
};

export default TimelineClip;
