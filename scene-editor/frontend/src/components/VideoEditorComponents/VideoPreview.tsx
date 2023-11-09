/*
Filename: VideoPreview.tsx
Description:
This file describes video previewer component of the video editor.
The video previewer allows the user to play the current edits made
to their assets.
 */

import React from "react";

import { Typography } from "@mui/material";
import { Paper } from "@mui/material/";

const VideoPreview: React.FC = () => {
  console.log("Video Previewer Rendered");

  return (
    <Paper sx={{ flexGrow: 1, backgroundColor: "#6aff6a" }}>
      <Typography>Preview</Typography>
    </Paper>
  );
};

export default React.memo(VideoPreview);
