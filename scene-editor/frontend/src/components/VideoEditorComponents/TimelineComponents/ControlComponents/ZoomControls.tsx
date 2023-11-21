/**
 * ZoomSlider.tsx
 *
 * Description:
 * This file contains the ZoomSlider Component for the video editor.
 * It allows the user to zoom in or out on the clips in the timeline.
 *
 */

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { Stack, IconButton } from "@mui/material";

import { useTimelineContext } from "../TimelineContext";
import { useClipsContext } from "../../ClipsContext";
import { useState } from "react";

const ZoomControls = () => {
  const defaultValue = 0;
  const minScale = 0;
  const maxScale = 8;
  const [sliderValue, setSliderValue] = useState<number>(defaultValue);

  const { setScale } = useTimelineContext();
  const { state: clipsState } = useClipsContext();

  function calculateScale(value: number) {
    return 2 ** value;
  }

  const canZoomOut = () => {
    return 0 < clipsState.clips.length && minScale < sliderValue;
  };

  const canZoomIn = () => {
    return 0 < clipsState.clips.length && sliderValue < maxScale;
  };

  const changeScaleDelta = (delta: number) => {
    const newValue = sliderValue + delta;
    const boundedValue = Math.min(Math.max(newValue, minScale), maxScale);
    setSliderValue(newValue);
    setScale(calculateScale(boundedValue));
  };

  const resetScale = () => {
    setScale(calculateScale(defaultValue));
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      minWidth={200}
      spacing={1}
      paddingX={1}
    >
      <IconButton disabled={!canZoomOut()} onClick={() => changeScaleDelta(-1)}>
        <ZoomOutIcon />
      </IconButton>
      <IconButton disabled={!canZoomIn()} onClick={() => changeScaleDelta(1)}>
        <ZoomInIcon />
      </IconButton>
      <IconButton onClick={resetScale}>
        <CloseFullscreenIcon />
      </IconButton>
    </Stack>
  );
};

export default ZoomControls;
