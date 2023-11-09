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

interface Asset {
  id: string;
  user_id: string;
  name: string;
  path: string;
  thumbnail_path: string;
  duration: number;
  file_size: number;
  asset_type: string;
  view_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  scene: number;
}

type TimelineProps = {
  height: number;
  assets: Asset[];
};

const Timeline: React.FC<TimelineProps> = ({ height, assets }) => {
  console.log("Timeline Bar Rendered");

  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  /* Compute the total time of all assets when it changes. */
  useEffect(() => {
    // TODO: computes sum of all assets not used assets
    setTotalTime(assets.reduce((partialSum, a) => partialSum + a.duration, 0));
  }, [assets]);

  return (
    <Paper sx={{ height: height, display: "flex", flexFlow: "column" }}>
      <Box sx={{ width: 1, display: "content" }}>
        <TimelineBar currentTime={currentTime} totalTime={totalTime} />
      </Box>
      <Box sx={{ flexGrow: 1, backgroundColor: "#6a9cff" }}>Hello</Box>
    </Paper>
  );
};

export default React.memo(Timeline);
