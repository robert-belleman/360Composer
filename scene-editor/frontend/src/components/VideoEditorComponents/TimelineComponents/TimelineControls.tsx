/**
 * TimelineControls.tsx
 *
 * Description:
 * This module defines the TimelineControls component responsible for rendering
 * the control buttons and functionalities for the timeline in the VideoEditor.
 * It includes features such as undo, redo, clip splitting, duplication, deletion,
 * and window manipulation (zoom in, zoom out, move left, move right).
 *
 */

import React, { memo } from "react";

/* Third Party Imports */
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";

/* Project Specific Imports */
import {
  DELETE_CLIPS,
  DUPLICATE_CLIPS,
  REDO,
  SPLIT_CLIP,
  UNDO,
  canRedo,
  canSplit,
  canUndo,
  useClipsContext,
} from "../ClipsContext";
import { useVideoContext } from "../VideoContext";
import { useTimelineContext } from "./TimelineContext";

/* The fraction that should be displayed per zoom level. */
const ZOOM_FRACTIONS_PER_LEVEL = [1, 0.8, 0.6, 0.4, 0.2];
/* The fraction to move the window when moving left or right. */
const WINDOW_TICKS = 0.1;

const TimelineButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = memo(({ disabled, onClick, icon }) => {
  const { isSeeking } = useVideoContext();
  return (
    <IconButton disabled={disabled || isSeeking} onClick={onClick}>
      {icon}
    </IconButton>
  );
});

const TimelineControls: React.FC = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  const { currentIndex, currentTime, currentDuration, setCurrentIndex, seek } =
    useVideoContext();
  const {
    lowerBound,
    upperBound,
    zoomLevel,
    setLowerBound,
    setUpperBound,
    setZoomLevel,
  } = useTimelineContext();

  /**
   * Move the window left or right by delta.
   * @param delta negative if moving left, positive if moving right.
   */
  const moveWindow = (delta: number) => {
    /* If the delta moves the lower too far, delta the upper bound. */
    if (lowerBound + delta < 0) {
      setLowerBound(0);
      setUpperBound(upperBound + delta - (lowerBound + delta));
      /* If the delta moves the upper too far, delta the lower bound. */
    } else if (upperBound + delta > 1) {
      setLowerBound(lowerBound + delta - (upperBound + delta - 1));
      setUpperBound(1);
    } else {
      setLowerBound(lowerBound + delta);
      setUpperBound(upperBound + delta);
    }
  };

  /**
   * Zoom the window in or out.
   * @param delta 1 if zooming in, 0 if zooming out.
   */
  const zoomWindow = (delta: number) => {
    /* Fraction of total video edit length visible. */
    let f = ZOOM_FRACTIONS_PER_LEVEL[zoomLevel + delta];
    const lo = f / 2;
    const hi = 1 - lo;
    let mid = currentTime / currentDuration;

    const lower = mid < lo ? 0 : mid > hi ? 1 - f : mid - lo;
    const upper = mid < lo ? f : mid > hi ? 1 : mid + lo;
    setLowerBound(lower);
    setUpperBound(upper);
  };

  /* Clip manipulation functions. */
  const handleUndo = () => {
    dispatch({ type: UNDO });
  };
  const handleRedo = () => {
    dispatch({ type: REDO });
  };
  const handleSplitClip = () => {
    dispatch({ type: SPLIT_CLIP, payload: { time: currentTime } });
  };
  const handleDuplicateClips = () => {
    dispatch({ type: DUPLICATE_CLIPS });
  };
  const handleDeleteClips = () => {
    dispatch({ type: DELETE_CLIPS });
  };

  /* Window manipulation functions. */
  const canMoveLeft = () => lowerBound > 0 && clipsState.clips.length > 0;
  const canMoveRight = () => upperBound < 1 && clipsState.clips.length > 0;
  const canResetZoom = () => zoomLevel !== 0;
  const canZoomOut = () => zoomLevel > 0 && clipsState.clips.length > 0;
  const canZoomIn = () => {
    return (
      zoomLevel < ZOOM_FRACTIONS_PER_LEVEL.length - 1 &&
      clipsState.clips.length > 0
    );
  };
  const moveLeft = () => moveWindow(-WINDOW_TICKS);
  const moveRight = () => moveWindow(WINDOW_TICKS);
  const resetZoom = () => {
    const zoomLvl = 0;
    setZoomLevel(zoomLvl);
    setLowerBound(0);
    setUpperBound(1);
  };
  const zoomOut = () => {
    if (canZoomOut()) {
      setZoomLevel(zoomLevel - 1);
      zoomWindow(-1);
    }
  };
  const zoomIn = () => {
    if (canZoomIn()) {
      setZoomLevel(zoomLevel + 1);
      zoomWindow(1);
    }
  };

  /**
   * Convert seconds to a user friendly display format. Note that the fractional
   * part of the seconds is not shown as the duratino is stored as an integer.
   * @param totalSeconds Total amount of seconds to convert.
   * @returns The time string.
   */
  const toDisplayTime = (totalSeconds: number) => {
    const clamped = Math.min(Math.max(totalSeconds, 0), currentDuration);
    const minutes = String(Math.floor(clamped / 60)).padStart(2, "0");
    const seconds = String(Math.floor(clamped % 60)).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const DisplayTime = () => {
    return (
      <Typography display="flex" alignItems="center" color={"black"}>
        {toDisplayTime(currentTime)}/{toDisplayTime(currentDuration)}
      </Typography>
    );
  };

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <TimelineButton
          disabled={!canUndo(clipsState)}
          onClick={handleUndo}
          icon={<UndoIcon />}
        />
        <TimelineButton
          disabled={!canRedo(clipsState)}
          onClick={handleRedo}
          icon={<RedoIcon />}
        />
        <TimelineButton
          disabled={!canSplit(clipsState)}
          onClick={handleSplitClip}
          icon={<ContentCutIcon />}
        />
        <TimelineButton
          disabled={false}
          onClick={handleDeleteClips}
          icon={<DeleteIcon />}
        />
        <TimelineButton
          disabled={false}
          onClick={handleDuplicateClips}
          icon={<ContentCopyIcon />}
        />
        <Box flexGrow={1} display="flex" justifyContent="center">
          <DisplayTime />
        </Box>
        <TimelineButton
          disabled={!canMoveLeft()}
          onClick={moveLeft}
          icon={<ArrowBackIosNewIcon />}
        />
        <TimelineButton
          disabled={!canMoveRight()}
          onClick={moveRight}
          icon={<ArrowForwardIosIcon />}
        />
        <TimelineButton
          disabled={!canZoomOut()}
          onClick={zoomOut}
          icon={<ZoomOutIcon />}
        />
        <TimelineButton
          disabled={!canZoomIn()}
          onClick={zoomIn}
          icon={<ZoomInIcon />}
        />
        <TimelineButton
          disabled={!canResetZoom()}
          onClick={resetZoom}
          icon={<CloseFullscreenIcon />}
        />
      </Toolbar>
    </AppBar>
  );
};

export default TimelineControls;
