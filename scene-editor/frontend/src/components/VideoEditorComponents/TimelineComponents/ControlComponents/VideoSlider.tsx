/**
 * VideoSlider.tsx
 *
 * Description:
 *   This file contains the VideoSlider Component for the video editor.
 *   It allows the user to seek a specific time in the entire video edit.
 *   A video edit is all the clips combined.
 *
 */

import { Slider } from "@mui/material";

import { useVideoContext } from "../../VideoContext";
import { useTimelineContext } from "../TimelineContext";
import { useEffect, useState } from "react";

const THUMB_CIRCLE_SIZE = 16;

const VideoSlider: React.FC = () => {
  const [thumbStyles, setThumbStyles] = useState({
    height: "0px",
    marginTop: "0px",
  });

  const { timelineWindowRef } = useTimelineContext();
  const { currentTime, currentDuration, seek } = useVideoContext();

  /**
   * Update the height of the thumb of the slider (vertical line).
   */
  useEffect(() => {
    const { current: timelineElem } = timelineWindowRef;

    if (timelineElem) {
      const thumbHeight = timelineElem.clientHeight;

      setThumbStyles({
        height: `${thumbHeight}px`,
        marginTop: `${thumbHeight + THUMB_CIRCLE_SIZE}px`,
      });
    }
  }, [timelineWindowRef]);

  /**
   * When the slider changes, seek that specific time in the video.
   * @param event slider onchange event.
   * @param newTime time to seek in the video.
   */
  const handleSliderChange = (event: Event, newTime: number | number[]) => {
    const { current: timelineElem } = timelineWindowRef;
    if (typeof newTime !== "number" || !timelineElem) return;

    seek(newTime);
  };

  return (
    <Slider
      aria-label="Time Slider"
      min={0}
      max={currentDuration}
      step={0.01}
      track={false}
      value={currentTime}
      onChange={handleSliderChange}
      sx={{
        color: "gold",
        /* Make the slider thumb a circle. */
        "& .MuiSlider-thumb": {
          width: THUMB_CIRCLE_SIZE,
          height: THUMB_CIRCLE_SIZE,
          borderRadius: "50%",
          backgroundColor: "gold",
          marginTop: "1px",
          /* Attach a vertical line to the slider. */
          "&::before": {
            width: "4px",
            borderRadius: 0,
            backgroundColor: "gold",
            ...thumbStyles,
          },
        },
      }}
    />
  );
};

export default VideoSlider;
