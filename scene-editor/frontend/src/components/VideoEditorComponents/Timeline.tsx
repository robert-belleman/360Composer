/*
Filename: Timeline.tsx
Description:
This file describes timeline component of the video editor.
Video assets can be placed onto the timeline or deleted from it.
The timeline acts as a place where the user can easily trim the
assets.
 */

import React, { useEffect, useState } from "react";

import { Box, Paper } from "@mui/material";

import TimelineBar from "./TimelineComponents/TimelineBar";
import TimelineLine from "./TimelineComponents/TimelineLine";
import Clip from "./Classes/Clip";
import Clips from "./Classes/Clips";

type TimelineProps = {
  clips: Clips;
  setClips: React.Dispatch<React.SetStateAction<Clips>>;
  height: number;
};

const Timeline: React.FC<TimelineProps> = ({ clips, setClips, height }) => {
  console.log("Timeline Rendered");

  return (
    <Paper sx={{ height: height, display: "flex", flexFlow: "column" }}>
      <Box width={1} sx={{ display: "content" }}>
        <TimelineBar clips={clips} setClips={setClips} />
      </Box>
      <Box
        sx={{
          height: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#6a9cff",
        }}
      >
        <TimelineLine clips={clips} />
      </Box>
    </Paper>
  );
};

export default Timeline;
