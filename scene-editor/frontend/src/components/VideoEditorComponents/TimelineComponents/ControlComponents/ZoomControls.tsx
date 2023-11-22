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
import { useEffect, useState } from "react";
import { useVideoContext } from "../../VideoContext";

const ZoomControls = () => {
  const defaultExponent = 0;
  const minExponent = 0;
  const minSecondsOnscreen = 2; // If you change this, also change log2().

  const [maxExponent, setMaxExponent] = useState(0);
  const [exponent, setExponent] = useState(defaultExponent);

  const { setScale } = useTimelineContext();
  const { state: clipsState } = useClipsContext();
  const { currentDuration } = useVideoContext();

  useEffect(() => {
    /* If the duration is too small to zoom in, then do not allow zooming. */
    if (currentDuration <= minSecondsOnscreen) {
      setMaxExponent(0);
      return;
    }

    /* Otherwise, compute how many times you can divide by two. */
    /* Note that log2() is hardcoded because it is more efficient. */
    const exp = Math.floor(Math.log2(currentDuration));
    setMaxExponent(exp - 1);
  }, [currentDuration]);

  function calculateScale(value: number) {
    return 2 ** value;
  }

  const canZoomOut = () => {
    return 0 < clipsState.clips.length && minExponent < exponent;
  };

  const canZoomIn = () => {
    return 0 < clipsState.clips.length && exponent < maxExponent;
  };

  const canZoomReset = () => {
    return exponent !== defaultExponent;
  };

  const changeScaleDelta = (delta: number) => {
    const newExp = exponent + delta;
    const boundedValue = Math.min(Math.max(newExp, minExponent), maxExponent);
    setExponent(newExp);
    setScale(calculateScale(boundedValue));
  };

  const resetScale = () => {
    setExponent(defaultExponent);
    setScale(calculateScale(defaultExponent));
  };

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={1}
      paddingX={1}
    >
      <IconButton disabled={!canZoomOut()} onClick={() => changeScaleDelta(-1)}>
        <ZoomOutIcon />
      </IconButton>
      <IconButton disabled={!canZoomIn()} onClick={() => changeScaleDelta(1)}>
        <ZoomInIcon />
      </IconButton>
      <IconButton disabled={!canZoomReset()} onClick={resetScale}>
        <CloseFullscreenIcon />
      </IconButton>
    </Stack>
  );
};

export default ZoomControls;
