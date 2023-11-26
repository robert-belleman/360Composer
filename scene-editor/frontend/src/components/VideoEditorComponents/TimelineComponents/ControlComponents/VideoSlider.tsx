/**
 * VideoSlider.tsx
 *
 * Description:
 *   This file contains the VideoSlider Component for the video editor.
 *   It allows the user to seek a specific time in the entire video edit.
 *   A video edit is all the clips combined.
 *
 */

import { Slider, styled } from "@mui/material";

import { useVideoContext } from "../../VideoContext";
import { useTimelineContext } from "../TimelineContext";
import { useEffect } from "react";

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "gold",
  /* Make the slider thumb a vertical line. */
  "& .MuiSlider-thumb": {
    width: 4, // Set the width of the thumb to make it a vertical line
    height: 250, // Make the thumb height equal to the slider height
    borderRadius: 0, // Remove border-radius to make it a straight line
    marginTop: 125, // Align the thumb to the top of the slider
    marginLeft: 1, // Center the thumb on the slider
    position: "relative", // Position relative for absolute positioning of the pseudo-element
    /* Attach a circle to the top of the vertical line. */
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

const VideoSlider: React.FC = () => {
  const { timelineWindowRef } = useTimelineContext();
  const { currentTime, currentDuration, seek } = useVideoContext();

  const handleSliderChange = (event: Event, newTime: number | number[]) => {
    const { current: timelineElem } = timelineWindowRef;
    if (typeof newTime !== "number" || !timelineElem) return;

    seek(newTime);
  };

  return (
    <CustomSlider
      aria-label="Time Slider"
      min={0}
      max={currentDuration}
      step={0.01}
      track={false}
      color="secondary"
      value={currentTime}
      onChange={handleSliderChange}
    />
  );
};

export default VideoSlider;
