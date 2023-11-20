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

import React from "react";

/* Third Party Imports */
import { Box, Paper, Slider } from "@mui/material";

/* Project Specific Imports */
import { TIMELINE_HEIGHT, TIMELINE_SLIDER_STEP } from "../Constants";
import { useVideoContext } from "../VideoContext";
import TimelineControls from "./TimelineControls";
import TimelineLayer from "./TimelineLayer";
import { useTimelineContext } from "./TimelineContext";

const Timeline: React.FC = () => {
  const { currentTime, currentDuration, seek } = useVideoContext();
  const { scale } = useTimelineContext();

  /**
   * Change the video time whenever the Slider value changes.
   * @param event
   * @param time
   */
  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") seek(time / scale);
  };

  return (
    <Paper
      sx={{ height: TIMELINE_HEIGHT, display: "flex", flexFlow: "column" }}
    >
      <Box>
        <TimelineControls />
        <Box overflow={"hidden"}>
          <Slider
            max={currentDuration * scale}
            step={TIMELINE_SLIDER_STEP * scale}
            value={currentTime * scale}
            onChange={handleTimeChange}
          />
        </Box>
      </Box>
      <TimelineLayer />
    </Paper>
  );
};

export default Timeline;
