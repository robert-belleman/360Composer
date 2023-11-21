/**
 * Timeline.tsx
 *
 * Description:
 * This module describes the Timeline Component of the VideoEditor.
 * This file contains the implementation of the time slider.
 *
 * The Timeline contains the following Components:
 *   - TimelineControls. Bar with options to control timeline.
 *   - TimelineArea. A Box showing multiple clips and their edits.
 *
 * TODO: make slider use onChangeCommitted on low resource devices
 *
 */

import React, { useRef } from "react";

/* Third Party Imports */
import { Stack } from "@mui/material";

/* Project Specific Imports */
import { TIMELINE_HEIGHT } from "../Constants";
import TimelineControls from "./TimelineControls";
import TimelineLayer from "./TimelineLayer";
import VideoSlider from "./ControlComponents/VideoSlider";

const Timeline: React.FC = () => {
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  return (
    <Stack
      height={TIMELINE_HEIGHT}
      padding={2}
      overflow="hidden"
      sx={{ backgroundColor: "royalblue" }}
    >
      <TimelineControls timelineContainerRef={timelineContainerRef} />
      <VideoSlider timelineContainerRef={timelineContainerRef} />
      <Stack
        ref={timelineContainerRef}
        height={1}
        display="flex"
        // justifyContent="center"
        sx={{
          backgroundColor: "cornflowerblue",
          borderStyle: "none dashed",
          overflowX: "auto",
        }}
      >
        <TimelineLayer />
      </Stack>
    </Stack>
  );
};

export default Timeline;
