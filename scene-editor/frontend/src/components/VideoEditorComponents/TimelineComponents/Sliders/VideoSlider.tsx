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

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "red",
}));

const VideoSlider = () => {
  const { currentTime, currentDuration, seek } = useVideoContext();

  /**
   * Change the video time whenever the Slider value changes.
   * @param event
   * @param time
   */
  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") seek(time);
  };

  return (
    <CustomSlider
      aria-label="Time Slider"
      max={currentDuration}
      step={0.1}
      value={currentTime}
      onChange={handleTimeChange}
    />
  );
};

export default VideoSlider;
