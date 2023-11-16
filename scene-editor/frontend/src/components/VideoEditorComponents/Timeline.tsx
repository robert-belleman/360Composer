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
 */

import React from "react";

/* Third Party Imports */
import { Box, Paper, Slider } from "@mui/material";

/* Project Specific Imports */
import { seekClip, useClipsContext } from "./ClipsContext";
import { TIMELINE_HEIGHT, TIMELINE_SLIDER_STEP } from "./Constants";
import TimelineArea from "./TimelineComponents/TimelineArea";
import {
  toDisplayTime,
  useTimelineContext,
} from "./TimelineComponents/TimelineContext";
import TimelineControls from "./TimelineComponents/TimelineControls";
import { useVideoContext } from "./VideoContext";

const Timeline: React.FC = () => {
  const { state: clipsState } = useClipsContext();
  const { selected, lowerBound, upperBound, setSelected } =
    useTimelineContext();
  const {
    currentTime,
    currentDuration,
    setIsSeeking,
    setCurrentNode,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
  } = useVideoContext();

  /**
   * Change the video time whenever the Slider value changes.
   * @param event
   * @param time
   */
  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") {
      const result = seekClip(clipsState, time);
      if (result.node) {
        setIsSeeking(true);
        setVideoClipTimePlayed(time - result.offset);
        setVideoClipTime(result.offset);
        setCurrentNode(result.node);
        setCurrentTime(time);
      }
    }
  };

  /**
   * Convert the fractions of the window bounds to seconds.
   * @returns Object with attributes `lowerBound` and `upperBound`.
   */
  const frac2Seconds = () => {
    const lower = Math.floor(lowerBound * currentDuration);
    const upper = Math.ceil(upperBound * currentDuration);
    return { lowerBound: lower, upperBound: upper };
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
            valueLabelFormat={(currentTime) => toDisplayTime(currentTime)}
            valueLabelDisplay="auto"
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
        <TimelineArea
          bounds={frac2Seconds()}
          selected={selected}
          setSelected={setSelected}
        />
      </Box>
    </Paper>
  );
};

export default Timeline;
