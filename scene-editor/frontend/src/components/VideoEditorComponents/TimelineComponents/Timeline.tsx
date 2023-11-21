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

import React, { useEffect, useRef, useState } from "react";

/* Third Party Imports */
import { Box, Button, Slider, Stack } from "@mui/material";

/* Project Specific Imports */
import { TIMELINE_HEIGHT } from "../Constants";
import TimelineControls from "./TimelineControls";
import TimelineLayer from "./TimelineLayer";
import VideoSlider from "./Sliders/VideoSlider";
import { useVideoContext } from "../VideoContext";
import { useTimelineContext } from "./TimelineContext";

const Timeline: React.FC = () => {
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const { currentDuration, seek } = useVideoContext();
  const { scale, setSliderValue } = useTimelineContext();

  const handleSliderChange = (event: Event, value: number | number[]) => {
    const { current: timelineElem } = timelineContainerRef;

    if (typeof value !== "number" || !timelineElem) {
      return;
    }

    setSliderValue(value);

    /* Compute the amount of seconds on the left side of the screen. */
    const widthTimeline = timelineElem.clientWidth * scale;
    const widthTimelineSecond = widthTimeline / currentDuration;
    const secondsOffscreen = timelineElem.scrollLeft / widthTimelineSecond;

    /* Compute the amount of seconds of the slider. */
    const widthSlider = timelineElem.clientWidth * value;
    const secondsOnscreen = widthSlider / widthTimelineSecond;

    /* The time indicated by the slider. */
    const newTime = secondsOffscreen + secondsOnscreen;
    seek(newTime);
  };

  return (
    <Stack height={TIMELINE_HEIGHT} sx={{ backgroundColor: "cornflowerblue" }}>
      <Box sx={{ backgroundColor: "royalblue" }} paddingX={2} overflow="hidden">
        <TimelineControls timelineContainerRef={timelineContainerRef} />
        <Slider
          aria-label="Time Slider"
          min={0}
          max={1}
          step={0.01}
          onChange={handleSliderChange}
        />
        {/* <VideoSlider /> */}
      </Box>
      <Stack
        ref={timelineContainerRef}
        height={1}
        marginX={2}
        display="flex"
        // justifyContent="center"
        sx={{ borderStyle: "none dashed", overflowX: "auto" }}
      >
        <TimelineLayer />
      </Stack>
    </Stack>
  );
};

export default Timeline;
