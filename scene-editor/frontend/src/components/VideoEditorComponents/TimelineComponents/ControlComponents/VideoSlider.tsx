/**
 * VideoSlider.tsx
 *
 * Description:
 * This file contains the VideoSlider Component for the video editor.
 * It allows the user to seek a specific time in the entire video edit.
 * A video edit is all the clips combined.
 *
 */

import { Slider, styled, Box } from "@mui/material";

import { useVideoContext } from "../../VideoContext";
import { useTimelineContext } from "../TimelineContext";
import { useEffect, useState } from "react";

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "gold",
  "& .MuiSlider-thumb": {
    width: 4, // Set the width of the thumb to make it a vertical line
    height: 264, // Make the thumb height equal to the slider height
    borderRadius: 0, // Remove border-radius to make it a straight line
    marginTop: 132, // Align the thumb to the top of the slider
    marginLeft: 1, // Center the thumb on the slider
    position: "relative", // Position relative for absolute positioning of the pseudo-element
    "&::before": {
      content: "''",
      position: "absolute",
      width: 16,
      height: 16,
      borderRadius: "50%", // Create a circle
      backgroundColor: "gold", // Color of the circle
      top: -8, // Align the circle to the top of the thumb
    },
  },
}));

interface VideoSliderProps {
  timelineContainerRef: React.RefObject<HTMLDivElement>;
}

const VideoSlider: React.FC<VideoSliderProps> = ({ timelineContainerRef }) => {
  const { scale, sliderValue, setSliderValue } = useTimelineContext();
  const { currentTime, currentDuration, seek } = useVideoContext();

  // useEffect(() => {
  //   const { current: timelineElem } = timelineContainerRef;
  //   if (!timelineElem || currentDuration === 0) return;

  //   const widthSecond = timelineElem.clientWidth * scale / currentDuration
  //   const widthCurrentTime = widthSecond * currentTime
  //   const widthOnscreen = widthCurrentTime % timelineElem.clientWidth
  //   const fracOnscreen = widthOnscreen / timelineElem.clientWidth
  //   // const widthTotal = (currentTime * scale) / currentDuration;
  //   // const widthSecond = timelineElem.clientWidth * scale / currentDuration
  //   // const widthOnscreen = widthTotal - screenWidthsLeft;
  //   /* Move the slider proportionally to the current time in the screen. */
  //   if (sliderValue < 1) {
  //     setSliderValue(fracOnscreen);
  //     return;
  //   }
  //   /* If the slider reaches the end, move the window a full step. */
  //   timelineElem.scrollLeft += timelineElem.clientWidth;
  //   setSliderValue(0);
  // }, [currentTime]);

  /**
   * When the slider changes, compute its new position compared to the entire
   * tape of video footage. The position compared to the entire width is
   * converted to the current time in comparison to the current duration.
   * After the position is converted to time, seek to it in the video.
   * @param event
   * @param value new slider value
   */
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
    <CustomSlider
      aria-label="Time Slider"
      min={0}
      max={1}
      step={0.01}
      track={false}
      color="secondary"
      value={sliderValue}
      onChange={handleSliderChange}
    />
  );
};

export default VideoSlider;
