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

type TimelineProps = {
  clips: any[];
  height: number;
};

const Timeline: React.FC<TimelineProps> = ({ clips, height }) => {
  console.log("Timeline Bar Rendered");

  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  /* Compute the total time of all assets when it changes. */
  useEffect(() => {
    // TODO: compute sum of used assets not all assets
    setTotalTime(clips.reduce((partialSum, a) => partialSum + a.duration, 0));
  }, [clips]);

  return (
    <Paper sx={{ height: height, display: "flex", flexFlow: "column" }}>
      <Box width={1} sx={{ display: "content" }}>
        <TimelineBar currentTime={currentTime} totalTime={totalTime} />
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

export default React.memo(Timeline);
