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

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "red",
}));

interface VideoSliderProps {
  timelineContainerRef: React.RefObject<HTMLDivElement>;
}

const VideoSlider: React.FC<VideoSliderProps> = ({ timelineContainerRef }) => {
  const { scale, sliderValue, setSliderValue } = useTimelineContext();
  const { currentTime, currentDuration, seek } = useVideoContext();

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
      color="secondary"
      value={sliderValue}
      onChange={handleSliderChange}
    />
  );
};

export default VideoSlider;
