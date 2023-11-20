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

  const { setScale } = useTimelineContext();
  const { state: clipsState } = useClipsContext();

  function calculateScale(value: number) {
    return 2 ** value;
  }

  const handleChangeScale = (event: Event, value: number | number[]) => {
    if (typeof value === "number") {
      setScale(calculateScale(value));
    }
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
      <ZoomOutIcon />
      <CustomSlider
        aria-label="Zoom"
        defaultValue={defaultValue}
        min={-1}
        max={8}
        step={0.01}
        track={false}
        marks={marks}
        color="secondary"
        onChange={handleChangeScale}
        disabled={clipsState.clips.length === 0}
      />
      <ZoomInIcon />
      <IconButton onClick={resetScale}>
        <CloseFullscreenIcon />
      </IconButton>
    </Stack>
  );
};

export default ZoomSlider;
