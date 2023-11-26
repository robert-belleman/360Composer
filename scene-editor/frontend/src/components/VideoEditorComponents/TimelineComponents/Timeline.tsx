/**
 * Timeline.tsx
 *
 * Description:
 * This module describes the Timeline Component of the VideoEditor.
 * This file contains the implementation of the time slider.
 *
 * The Timeline contains the following Components:
 *   - TimelineControls. Bar with options to control timeline.
 *   - VideoSlider. A slider to indicate a specific time in the video.
 *   - TimelineLayer. A layer with sortable timeline clips.
 *
 * TODO: make slider use onChangeCommitted on low resource devices
 *
 */

import React from "react";

/* Third Party Imports */
import { Box, Stack } from "@mui/material";

/* Project Specific Imports */
import { TIMELINE_HEIGHT } from "../Constants";
import VideoSlider from "./ControlComponents/VideoSlider";
import { useTimelineContext } from "./TimelineContext";
import TimelineControls from "./TimelineControls";
import TimelineLayer from "./TimelineLayer";

const Timeline: React.FC = () => {
  const { scale, timelineWindowRef } = useTimelineContext();

  return (
    <Stack
      height={TIMELINE_HEIGHT}
      overflow="hidden"
      paddingX={{ sx: 0, md: 2 }}
      sx={{ backgroundColor: "royalblue" }}
    >
      <TimelineControls />
      <Stack
        ref={timelineWindowRef}
        height={1}
        sx={{
          backgroundColor: "cornflowerblue",
          borderStyle: "none dashed",
          overflowX: "scroll",
        }}
      >
        <Box sx={{ width: `${scale * 100}%` }}>
          <VideoSlider />
          <TimelineLayer />
        </Box>
      </Stack>
    </Stack>
  );
};

export default Timeline;
