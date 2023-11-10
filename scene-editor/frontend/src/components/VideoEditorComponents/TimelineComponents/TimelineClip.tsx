/*
Filename: TimelineClip.tsx
Description:
This file describes a single clip on the timeline.
 */

import React from "react";

import { Box } from "@mui/material";

import Clip from "../Classes/Clip";

const clipHeight = 64;

type TimelineClipProps = {
  clip: Clip;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ clip }) => {
  return (
    <Box
      sx={{
        background: `url(${clip.getUrl()})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        height: clipHeight,
        flexGrow: clip.getDuration(),
        borderRadius: 4,
        borderRight: 4,
        borderLeft: 4,
        borderWidth: 2,
        borderColor: "#6a9cff",
      }}
    ></Box>
  );
};

export default React.memo(TimelineClip);
