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
import TimelineControls from "./ControlComponents/TimelineControls";
import VideoSlider from "./ControlComponents/VideoSlider";
import { useTimelineContext } from "./TimelineContext";
import TimelineLayer from "./TimelineLayer";

const Timeline: React.FC = () => {
  const { scale, timelineWindowRef } = useTimelineContext();

  return (
    <Stack
      height={TIMELINE_HEIGHT}
      paddingX={{ sx: 0, md: 2 }}
      sx={{ backgroundColor: "royalblue" }}
    >
      <TimelineControls />

      <Box
        ref={timelineWindowRef}
        height={1}
        paddingX={2}
        sx={{
          backgroundColor: "cornflowerblue",
          overflowX: "scroll",
          overflowY: "hidden",
        }}
      >
        <Box
          width={`${scale * 100}%`}
          height={1}
          boxSizing="border-box"
          sx={{ borderStyle: "none dashed" }}
        >
          <VideoSlider />
          <TimelineLayer />
        </Box>
      </Box>
    </Stack>
  );
};

export default Timeline;
