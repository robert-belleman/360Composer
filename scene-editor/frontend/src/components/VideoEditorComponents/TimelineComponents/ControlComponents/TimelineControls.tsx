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

import React, { memo, useCallback } from "react";

/* Third Party Imports */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { Grid, Hidden, IconButton, Typography } from "@mui/material";

/* Project Specific Imports */
import {
  ActionTypes,
  canRedo,
  canUndo,
  useClipsContext,
} from "../../ClipsContext";
import { useVideoContext } from "../../VideoContext";
import ZoomControls from "./ZoomControls";
import { MINIMUM_CLIP_LENGTH } from "../../Constants";

export const undoAction = () => ({
  type: ActionTypes.UNDO as const,
});

export const redoAction = () => ({
  type: ActionTypes.REDO as const,
});

export const splitClipAction = (currentTime: number) => ({
  type: ActionTypes.SPLIT_CLIP as const,
  payload: { time: currentTime },
});

export const duplicateClipsAction = () => ({
  type: ActionTypes.DUPLICATE_CLIPS as const,
});

export const deleteClipsAction = () => ({
  type: ActionTypes.DELETE_CLIPS as const,
});

const TimelineButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = memo(({ disabled, onClick, icon, label }) => {
  const { isSeeking } = useVideoContext();
  return (
    <IconButton
      disabled={disabled || isSeeking}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </IconButton>
  );
});

const ClipManipulationButtons = ({ currentTime }: { currentTime: number }) => {
  const { videoClipTimePlayed } = useVideoContext();
  const { state: clipsState, dispatch } = useClipsContext();

  /* Clip manipulation functions. */
  const handleUndo = useCallback(() => {
    dispatch(undoAction());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redoAction());
  }, [dispatch]);

  const canSplit = () => {
    return currentTime - videoClipTimePlayed >= MINIMUM_CLIP_LENGTH;
  };

  const handleSplitClip = useCallback(() => {
    dispatch(splitClipAction(currentTime));
  }, [dispatch, currentTime]);

  const handleDuplicateClips = useCallback(() => {
    dispatch(duplicateClipsAction());
  }, [dispatch]);

  const handleDeleteClips = useCallback(() => {
    dispatch(deleteClipsAction());
  }, [dispatch]);

  return (
    <>
      <TimelineButton
        disabled={!canUndo(clipsState)}
        onClick={handleUndo}
        icon={<UndoIcon />}
        label="Undo"
      />
      <TimelineButton
        disabled={!canRedo(clipsState)}
        onClick={handleRedo}
        icon={<RedoIcon />}
        label="Redo"
      />
      <TimelineButton
        disabled={!canSplit()}
        onClick={handleSplitClip}
        icon={<ContentCutIcon />}
        label="Split"
      />
      <TimelineButton
        disabled={false}
        onClick={handleDeleteClips}
        icon={<DeleteIcon />}
        label="Delete"
      />
      <TimelineButton
        disabled={false}
        onClick={handleDuplicateClips}
        icon={<ContentCopyIcon />}
        label="Duplicate"
      />
    </>
  );
};

const TimelineControls = () => {
  const { currentTime, currentDuration } = useVideoContext();

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
      <Typography color={"black"}>
        {toDisplayTime(currentTime)}/{toDisplayTime(currentDuration)}
      </Typography>
    );
  };

  return (
    <Grid
      container
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      {/* For larger screens, show both sets of buttons */}
      <Hidden smDown>
        <Grid item md={5}>
          <ClipManipulationButtons currentTime={currentTime} />
        </Grid>
        <Grid item md={2} display="flex" justifyContent="center">
          <DisplayTime />
        </Grid>
        <Grid item md={5}>
          <ZoomControls />
        </Grid>
      </Hidden>

      {/* For smaller screens, buttons are combined with display time below */}
      <Hidden smUp>
        <Grid item xs={7}>
          <ClipManipulationButtons currentTime={currentTime} />
        </Grid>
        <Grid item xs={5}>
          <ZoomControls />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          <DisplayTime />
        </Grid>
      </Hidden>
    </Grid>
  );
};

export default TimelineControls;
