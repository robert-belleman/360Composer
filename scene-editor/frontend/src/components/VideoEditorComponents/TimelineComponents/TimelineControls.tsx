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
  const { currentTime, currentDuration } = useVideoContext();
  const { scale, setScale } = useTimelineContext();

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

  const canZoomOut = () => {
    return true; // TODO
  };
  const canZoomIn = () => {
    return true; // TODO
  };
  const canZoomReset = () => {
    return true; // TODO
  };
  const zoomOut = () => {
    setScale(scale - 10); // TODO finalize values
  };
  const zoomIn = () => {
    setScale(scale + 10); // TODO finalize values
  };
  const zoomReset = () => {
    setScale(30); // TODO finalize values
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
          disabled={!canZoomReset()}
          onClick={zoomReset}
          icon={<CloseFullscreenIcon />}
        />
      </Toolbar>
    </AppBar>
  );
};

export default TimelineControls;
