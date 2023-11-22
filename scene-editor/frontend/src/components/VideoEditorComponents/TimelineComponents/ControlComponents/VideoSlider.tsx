/**
 * VideoSlider.tsx
 *
 * Description:
 *   This file contains the VideoSlider Component for the video editor.
 *   It allows the user to seek a specific time in the entire video edit.
 *   A video edit is all the clips combined.
 *
 * Terminology in this file:
 * - Let "tape" denote all the videos on the timeline. The user can scroll
 *   through the tape when the window is zoomed in.
 * - Let "tapeTime" be the conversion of time in seconds to the length on
 *   the entire tape.
 * - Let "sliderTime" be the conversion of time in seconds to the length on
 *   the visible tape.
 * - Let "onscreen" be the visible tape on the screen.
 * - Let "offscreen" be the not visible tape to the left of the onscreen tape.
 *
 * Slider Information:
 * - The slider with value `sliderTime` has range [0, 1].
 * - The value of the slider is the current sliderTime onscreen.
 * - The offscreen tapeTime can be computed from the scrollLeft attribute of
 *   the timeline window that holds the tape.
 *
 * Example:
 * Let "tape" have 24 seconds of footage, then
 * - For `scale` = 1:
 *   - `sliderTime` = 0    => 0    * 24 = 0  seconds onscreen.
 *   - `sliderTime` = 0.25 => 0.25 * 24 = 6  seconds onscreen.
 *   - `sliderTime` = 1    => 1    * 24 = 24 seconds onscreen.
 *   * Since scale = 1, the entire tape is visible.
 * - For `scale` = 2:
 *   - `sliderTime` = 0    => 0    * 24 / 2 = 0  seconds onscreen.
 *   - `sliderTime` = 0.25 => 0.25 * 24 / 2 = 3  seconds onscreen.
 *   - `sliderTime` = 1    => 1    * 24 / 2 = 12 seconds onscreen.
 *   * Since scale > 1, part of the tape is offscreen.
 *
 */

import { Slider, styled } from "@mui/material";

import { useVideoContext } from "../../VideoContext";
import { useTimelineContext } from "../TimelineContext";
import { useEffect, useState } from "react";

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "gold",
  /* Make the slider thumb a vertical line. */
  "& .MuiSlider-thumb": {
    width: 4, // Set the width of the thumb to make it a vertical line
    height: 264, // Make the thumb height equal to the slider height
    borderRadius: 0, // Remove border-radius to make it a straight line
    marginTop: 132, // Align the thumb to the top of the slider
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
  const [sliderSecond, setSliderSecond] = useState(0);
  const [tapeSecond, setTapeSecond] = useState(0);

  const { timelineWindowRef, scale, sliderTime, setSliderTime } =
    useTimelineContext();
  const { currentTime, currentDuration, seek } = useVideoContext();

  /**
   * Update sliderSecond and tapeSecond only when the scale, duration or
   * the timeline window reference changes. These values do not change as
   * often as things like the current time. Therefore they are put in a
   * separate useEffect and only updated when necessary.
   */
  useEffect(() => {
    const { current: timelineElem } = timelineWindowRef;
    if (!timelineElem) return;

    // Compute the size of a single second on the slider and the tape.
    const newSliderSecond = scale / currentDuration;
    const newTapeSecond = newSliderSecond * timelineElem.clientWidth;

    // Update state only if the values have changed.
    if (newSliderSecond !== sliderSecond) {
      setSliderSecond(newSliderSecond);
    }

    if (newTapeSecond !== tapeSecond) {
      setTapeSecond(newTapeSecond);
    }
  }, [scale, currentDuration, timelineWindowRef]);

  /**
   * When the slider changes, compute its new position compared to the entire
   * tape of video footage. The position compared to the entire width is
   * converted to the current time in comparison to the current duration.
   * After the position is converted to time, seek to it in the video.
   * See header comment for more information on `sliderTime`.
   * @param event
   * @param value new slider value
   */
  const handleSliderChange = (event: Event, value: number | number[]) => {
    const { current: timelineElem } = timelineWindowRef;
    if (typeof value !== "number" || !timelineElem) return;

    /* Compute the seconds offscreen and onscreen. */
    const secondsOffscreen = timelineElem.scrollLeft / tapeSecond;
    const secondsOnscreen = value / sliderSecond;

    /* Sum the seconds offscreen and onscreen to get the indicated time. */
    const seekTime = secondsOffscreen + secondsOnscreen;
    seek(seekTime);

    setSliderTime(value);
  };

  /**
   * Update the slider time with the current time.
   * See header comment for more information on `sliderTime`.
   */
  useEffect(() => {
    const { current: timelineElem } = timelineWindowRef;
    if (!timelineElem) return;

    /* Compute the seconds offscreen and onscreen. */
    const secondsOffscreen = timelineElem.scrollLeft / tapeSecond;
    const secondsOnscreen = currentTime - secondsOffscreen;

    /* Compute the new slider value using the seconds onscreen. */
    const onscreenSliderTime = secondsOnscreen * sliderSecond;
    const newSliderTime = isNaN(onscreenSliderTime) ? 0 : onscreenSliderTime;
    setSliderTime(newSliderTime);

    /* Move the timeline window if the indicator is offscreen. */
    if (newSliderTime > 1) timelineElem.scrollLeft += timelineElem.clientWidth;
  }, [currentTime]);

  return (
    <CustomSlider
      aria-label="Time Slider"
      min={0}
      max={1}
      step={0.01}
      track={false}
      color="secondary"
      value={sliderTime}
      onChange={handleSliderChange}
    />
  );
};

export default VideoSlider;
