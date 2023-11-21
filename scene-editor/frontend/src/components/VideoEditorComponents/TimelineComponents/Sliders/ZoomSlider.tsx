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
import { Slider, styled, Stack, IconButton } from "@mui/material";

import { useTimelineContext } from "../TimelineContext";
import { useClipsContext } from "../../ClipsContext";
import { useState } from "react";

const marks = [
  {
    value: 0,
  },
];

const CustomSlider = styled(Slider)(({ theme }) => ({
  color: "palegreen",
}));

const ZoomSlider = () => {
  const defaultValue = 0;
  const minScale = 0;
  const maxScale = 8;
  const [sliderValue, setSliderValue] = useState<number>(defaultValue);

  const { setScale } = useTimelineContext();
  const { state: clipsState } = useClipsContext();

  function calculateScale(value: number) {
    return 2 ** value;
  }

  const handleChangeScale = (event: Event, value: number | number[]) => {
    if (typeof value === "number") {
      setSliderValue(value);
      setScale(calculateScale(value));
    }
  };

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
      <CustomSlider
        aria-label="Zoom"
        defaultValue={defaultValue}
        min={minScale}
        max={maxScale}
        step={0.01}
        value={sliderValue}
        track={false}
        marks={marks}
        color="secondary"
        onChange={handleChangeScale}
        disabled={clipsState.clips.length === 0}
      />
      <IconButton disabled={!canZoomIn()} onClick={() => changeScaleDelta(1)}>
        <ZoomInIcon />
      </IconButton>
      <IconButton onClick={resetScale}>
        <CloseFullscreenIcon />
      </IconButton>
    </Stack>
  );
};

export default ZoomSlider;
