/*
Filename: TimelineClip.tsx
Description:
This file describes a single clip on the timeline.
 */

import React from "react";

import { Box } from "@mui/material";

import defaultImage from "../../../static/images/default.jpg";

const clipHeight = 64;

type TimelineClipProps = {
  clip: any;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ clip }) => {
  let thumbnail_url = clip.thumbnail_path
    ? `/api/asset/${clip.id}/thumbnail`
    : defaultImage;

  return (
    <Box
      sx={{
        background: `url(${thumbnail_url}) repeat-x`,
        backgroundSize: "contain",
        height: clipHeight,
        flexGrow: clip.duration,
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
