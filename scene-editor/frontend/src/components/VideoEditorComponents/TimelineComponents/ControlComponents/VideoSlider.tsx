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
import { useEffect, useLayoutEffect, useState } from "react";

const THUMB_CIRCLE_SIZE = 16;

const VideoSlider: React.FC = () => {
  const [onscreenSeconds, setOnscreenSeconds] = useState(0);
  const [thumbStyles, setThumbStyles] = useState({
    height: "0px",
    marginTop: "0px",
  });

  const { scale, timelineWindowRef } = useTimelineContext();
  const { videoTime, videoDuration, seek } = useVideoContext();

  /**
   * When the scale changes, compute how many seconds fit on screen.
   */
  useLayoutEffect(() => {
    setOnscreenSeconds(videoDuration / scale);
  }, [scale]);

  /**
   * Update the height of the thumb of the slider (vertical line).
   */
  useEffect(() => {
    const { current: timelineElem } = timelineWindowRef;
    if (!timelineElem) return;

    const thumbHeight = timelineElem.clientHeight;

    setThumbStyles({
      height: `${thumbHeight}px`,
      marginTop: `${thumbHeight + THUMB_CIRCLE_SIZE}px`,
    });
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

  const _movedOffscreenRight = () => {
    const { current: timelineElem } = timelineWindowRef;
    if (!timelineElem) return;

    /* Compute the total length of the video tape. */
    const tapeTotalLength = timelineElem.clientWidth * scale;

    /* Compute the length of the video tape to the left of the screen. */
    const tapeOffscreenLeftLength = timelineElem.scrollLeft / tapeTotalLength;

    /* Convert the length to seconds. */
    const offscreenSeconds = tapeOffscreenLeftLength * videoDuration;

    /* Check if `videoTime` exceeds the rightside of the screen. */
    return offscreenSeconds + onscreenSeconds <= videoTime;
  };

  /**
   * Whenever the slider goes offscreen, move the timeline a screen right.
   */
  useEffect(() => {
    const { current: timelineElem } = timelineWindowRef;
    if (!timelineElem) return;

    if (_movedOffscreenRight()) {
      timelineElem.scrollLeft += timelineElem.clientWidth;
    }
  }, [videoTime]);

  return (
    <Slider
      aria-label="Time Slider"
      min={0}
      max={videoDuration}
      step={0.01}
      track={false}
      value={videoTime}
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
