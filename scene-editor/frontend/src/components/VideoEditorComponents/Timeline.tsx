/**
 * Timeline.tsx
 *
 * Description:
 * This module describes the Timeline Component of the VideoEditor.
 * This file mostly focuses on the menu options regarding the timeline.
 * Example options are: Cut/Trim, Delete, Duplicate, etc.
 *
 * The Timeline contains the following Components:
 *   - TimelineArea. A Box showing multiple clips and their edits.
 *
 */

import React, { useEffect, useState } from "react";

import {
  AppBar,
  Box,
  IconButton,
  Paper,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

import TimelineArea from "./TimelineComponents/TimelineArea";

import { TIMELINE_HEIGHT } from "./Constants";

import {
  DELETE_CLIPS,
  DUPLICATE_CLIPS,
  REDO,
  SPLIT_CLIP,
  UNDO,
  canRedo,
  canUndo,
  useClipsContext,
} from "./ClipsContext";

/* The fraction that should be displayed per zoom level. */
const ZOOM_FRACTIONS_PER_LEVEL = [1, 0.8, 0.6, 0.4, 0.2];
/* The fraction to move the camera when moving left or right. */
const CAMERA_WINDOW_TICKS = 0.1;

const Timeline: React.FC = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  /* Boolean that describes if the video is playing. */
  const [isPlaying, setIsPlaying] = useState(false);
  /* The current time in the video edit. */
  const [currentTime, setCurrentTime] = useState(0);
  /* The sum of all clips in the video edit. */
  const [totalTime, setTotalTime] = useState(0);
  /* Level of zoom used as index for ZOOM_FRACTIONS_PER_LEVEL. */
  const [zoomLevel, setZoomLevel] = useState(0);
  /* Bounds of the timeline window (as fraction). */
  const [camLowerBound, setCamLowerBound] = useState(0);
  const [camUpperBound, setCamUpperBound] = useState(1);

  /* Compute the total time of all clips when it changes. */
  useEffect(() => {
    setTotalTime(clipsState.clips.sum((clip) => clip.duration));
  }, [clipsState.clips]);

  /* Count up until end of video. */
  useEffect(() => {
    if (totalTime < currentTime) {
      setCurrentTime(0);
    }

    if (isPlaying && currentTime < totalTime) {
      const id = setInterval(
        () => setCurrentTime((currentTime) => currentTime + 1),
        1000
      );

      return () => {
        clearInterval(id);
      };
    }
  }, [isPlaying, currentTime, totalTime]);

  const handleUndo = () => {
    dispatch({ type: UNDO });
  };

  const handleRedo = () => {
    dispatch({ type: REDO });
  };

  const handleSplitClip = (time: number) => {
    dispatch({ type: SPLIT_CLIP, payload: { time: time } });
  };

  const handleDeleteClips = () => {
    dispatch({ type: DELETE_CLIPS });
  };

  const handleDuplicateClips = () => {
    dispatch({ type: DUPLICATE_CLIPS });
  };

  const handleTimeChange = (event: Event, time: number | number[]) => {
    if (typeof time === "number") {
      setCurrentTime(time);
      updateCameraBounds(0, 0);
    }
  };

  const toTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    let strMinutes = minutes < 10 ? "0" + minutes : minutes;
    let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return `${strMinutes}:${strSeconds}`;
  };

  /**
   * Move the screen window on the timeline.
   * @param zoomOffset 1 if zooming in, -1 if zooming out, 0 otherwise.
   * @param offset +number if moving ->, -number if moving <-, 0 otherwise.
   */
  const updateCameraBounds = (zoomOffset: number, offset: number) => {
    const moveCamera = () => {
      /* If the offset moves the lower too far, offset the upper bound. */
      if (camLowerBound + offset < 0) {
        setCamLowerBound(0);
        setCamUpperBound(camUpperBound + offset - (camLowerBound + offset));
        /* If the offset moves the upper too far, offset the lower bound. */
      } else if (camUpperBound + offset > 1) {
        setCamLowerBound(camLowerBound + offset - (camUpperBound + offset - 1));
        setCamUpperBound(1);
      } else {
        setCamLowerBound(camLowerBound + offset);
        setCamUpperBound(camUpperBound + offset);
      }
    };
    const zoomCamera = () => {
      /* Fraction of total video edit length visible. */
      let f = ZOOM_FRACTIONS_PER_LEVEL[zoomLevel + zoomOffset];
      const lo = f / 2;
      const hi = 1 - lo;
      let mid = currentTime / totalTime;

      const lower = mid < lo ? 0 : mid > hi ? 1 - f : mid - lo;
      const upper = mid < lo ? f : mid > hi ? 1 : mid + lo;
      setCamLowerBound(lower);
      setCamUpperBound(upper);
    };
    offset === 0 ? zoomCamera() : moveCamera();
  };

  /* Compute the bounds of the screen window [`low`, `high`] in seconds. */
  const windowInfo = () => {
    const low = Math.floor(camLowerBound * totalTime);
    const high = Math.ceil(camUpperBound * totalTime);
    return [low, high, zoomLevel];
  };

  const UndoButton = () => {
    return (
      <IconButton disabled={!canUndo(clipsState)} onClick={handleUndo}>
        <UndoIcon />
      </IconButton>
    );
  };

  const RedoButton = () => {
    return (
      <IconButton disabled={!canRedo(clipsState)} onClick={handleRedo}>
        <RedoIcon />
      </IconButton>
    );
  };

  const SplitButton = () => {
    return (
      <IconButton onClick={() => handleSplitClip(currentTime)}>
        <ContentCutIcon />
      </IconButton>
    );
  };

  const DeleteButton = () => {
    // TODO
    return (
      <IconButton onClick={() => handleDeleteClips()}>
        <DeleteIcon />
      </IconButton>
    );
  };

  const DuplicateButton = () => {
    // TODO
    return (
      <IconButton onClick={() => handleDuplicateClips()}>
        <ContentCopyIcon />
      </IconButton>
    );
  };

  const PlayPauseButton = () => {
    const updatePlaying = () => {
      let playing = totalTime > 0 ? !isPlaying : false;
      if (currentTime === totalTime) {
        setCurrentTime(0);
        playing = true;
      }
      setIsPlaying(playing);
    };
    return (
      <IconButton onClick={() => updatePlaying()}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    );
  };

  const MoveLeftButton = () => {
    const canMoveLeft = () => {
      return camLowerBound > 0 && clipsState.clips.length > 0;
    };

    const moveLeft = () => {
      updateCameraBounds(0, -CAMERA_WINDOW_TICKS);
    };

    return (
      <IconButton disabled={!canMoveLeft()} onClick={moveLeft}>
        <ArrowBackIosNewIcon />
      </IconButton>
    );
  };

  const MoveRightButton = () => {
    const canMoveRight = () => {
      return camUpperBound < 1 && clipsState.clips.length > 0;
    };

    const moveRight = () => {
      updateCameraBounds(0, CAMERA_WINDOW_TICKS);
    };

    return (
      <IconButton disabled={!canMoveRight()} onClick={moveRight}>
        <ArrowForwardIosIcon />
      </IconButton>
    );
  };

  const ZoomOutButton = () => {
    const canZoomOut = () => {
      return zoomLevel > 0 && clipsState.clips.length > 0;
    };

    const zoomOut = () => {
      if (canZoomOut()) {
        setZoomLevel(zoomLevel - 1);
        updateCameraBounds(-1, 0);
      }
    };

    return (
      <IconButton disabled={!canZoomOut()} onClick={zoomOut}>
        <ZoomOutIcon />
      </IconButton>
    );
  };

  const ZoomInButton = () => {
    const canZoomIn = () => {
      return (
        zoomLevel < ZOOM_FRACTIONS_PER_LEVEL.length - 1 && clipsState.clips.length > 0
      );
    };

    const zoomIn = () => {
      if (canZoomIn()) {
        setZoomLevel(zoomLevel + 1);
        updateCameraBounds(1, 0);
      }
    };

    return (
      <IconButton disabled={!canZoomIn()} onClick={zoomIn}>
        <ZoomInIcon />
      </IconButton>
    );
  };

  const ZoomFitButton = () => {
    const resetZoom = () => {
      const zoomLvl = 0;
      setZoomLevel(zoomLvl);
      setCamLowerBound(0);
      setCamUpperBound(1);
    };

    return (
      <IconButton disabled={zoomLevel === 0} onClick={() => resetZoom()}>
        <CloseFullscreenIcon />
      </IconButton>
    );
  };

  const TimelineBar = () => {
    const Timer = () => {
      /* Convert seconds to minute:seconds */
      const toTime = (seconds: number) => {
        let minutes = Math.floor(seconds / 60);
        let extraSeconds = seconds % 60;
        let strMinutes = minutes < 10 ? "0" + minutes : minutes;
        let strSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
        return `${strMinutes}:${strSeconds}`;
      };

      let strCurrentTime = toTime(currentTime);
      let strTotalTime = toTime(totalTime);
      return (
        <Typography display="flex" alignItems="center" color={"black"}>
          {strCurrentTime}/{strTotalTime}
        </Typography>
      );
    };

    return (
      <AppBar position="static">
        <Toolbar variant="dense">
          <UndoButton />
          <RedoButton />
          <SplitButton />
          <DeleteButton />
          <DuplicateButton />
          <Box flexGrow={1} display="flex" justifyContent="center">
            <PlayPauseButton />
            <Timer />
          </Box>
          <MoveLeftButton />
          <MoveRightButton />
          <ZoomOutButton />
          <ZoomInButton />
          <ZoomFitButton />
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <Paper
      sx={{ height: TIMELINE_HEIGHT, display: "flex", flexFlow: "column" }}
    >
      <Box>
        <TimelineBar />
        <Box overflow={"hidden"}>
          <Slider
            max={totalTime}
            value={currentTime}
            onChange={handleTimeChange}
            valueLabelFormat={(currentTime) => toTime(currentTime)}
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
      <Box
        height={1}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        sx={{ backgroundColor: "cornflowerblue" }}
      >
        <TimelineArea bounds={windowInfo()} />
      </Box>
    </Paper>
  );
};

export default Timeline;
