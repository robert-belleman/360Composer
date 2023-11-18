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
import TimelineLayers from "./TimelineLayers";

const Timeline: React.FC = () => {
  const {
    currentTime,
    currentDuration,
    setIsSeeking,
    setCurrentNode,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
    seek,
  } = useVideoContext();

  /**
   * Change the video time whenever the Slider value changes.
   * @param event
   * @param time
   */
  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") seek(time);
  };

  return (
    <Paper
      sx={{ height: TIMELINE_HEIGHT, display: "flex", flexFlow: "column" }}
    >
      <Box>
        <TimelineControls />
        <Box overflow={"hidden"}>
          <Slider
            max={currentDuration}
            step={TIMELINE_SLIDER_STEP}
            value={currentTime}
            onChange={handleTimeChange}
          />
        </Box>
      </Box>
      <Box
        height={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        sx={{ backgroundColor: "cornflowerblue" }}
      >
        <TimelineLayers />
      </Box>
    </Paper>
  );
};

export default Timeline;
