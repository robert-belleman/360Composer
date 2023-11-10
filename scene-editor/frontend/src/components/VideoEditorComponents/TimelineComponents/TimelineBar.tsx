/*
Filename: Timeline.tsx
Description:
This file describes timeline bar component of the video editor.
It contains buttons to modify the timeline and displays the
current time and total time of all media on the timeline.
 */

import React, { useState, useEffect } from "react";

import {
  AppBar,
  Box,
  IconButton,
  Slider,
  Toolbar,
  Typography,
} from "@mui/material";

import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Clips from "../Classes/Clips";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

type TimelineBarProps = {
  clips: Clips;
  setClips: React.Dispatch<React.SetStateAction<Clips>>;
};

const TimelineBar: React.FC<TimelineBarProps> = ({ clips, setClips }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  /* Compute the total time of all clips when it changes. */
  useEffect(() => {
    setTotalTime(clips.data.reduce((acc, clip) => acc + clip.getDuration(), 0));
  }, [clips]);

  /* Count up until end of video. */
  useEffect(() => {
    if (isPlaying && currentTime < totalTime) {
      const id = setInterval(
        () => setCurrentTime((currentTime) => currentTime + 1),
        1000
      );

      return () => {
        clearInterval(id);
      };
    }
  }, [isPlaying, currentTime]);

  const updatePlaying = () => {
    let playing = totalTime > 0 ? !isPlaying : false;
    if (currentTime === totalTime) {
      setCurrentTime(0);
      playing = true;
    }
    setIsPlaying(playing);
  };

  const UndoButton = () => {
    return (
      <IconButton>
        <UndoIcon />
      </IconButton>
    );
  };

  const RedoButton = () => {
    return (
      <IconButton>
        <RedoIcon />
      </IconButton>
    );
  };

  const CutButton = () => {
    return (
      <IconButton onClick={() => setClips(clips.split(1))}>
        <ContentCutIcon />
      </IconButton>
    );
  };

  const DeleteButton = () => {
    return (
      <IconButton>
        <DeleteIcon />
      </IconButton>
    );
  };

  const CopyButton = () => {
    return (
      <IconButton>
        <ContentCopyIcon />
      </IconButton>
    );
  };

  const PlayPauseButton = () => {
    return (
      <IconButton onClick={() => updatePlaying()}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    );
  };

  const ZoomOutButton = () => {
    return (
      <IconButton>
        <ZoomOutIcon />
      </IconButton>
    );
  };

  const ZoomInButton = () => {
    return (
      <IconButton>
        <ZoomInIcon />
      </IconButton>
    );
  };

  const ZoomFitButton = () => {
    return (
      <IconButton>
        <CloseFullscreenIcon />
      </IconButton>
    );
  };

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

  const TimeSlider = () => {
    /* Change current time `currentTime` to slider value. */
    const handleChange = (event: Event, newValue: number | number[]) => {
      if (typeof newValue === "number") {
        setCurrentTime(newValue);
      }
    };

    return (
      <Slider
        max={totalTime}
        value={currentTime}
        onChange={handleChange}
        sx={{
          "& .MuiSlider-thumb": {
            color: "red",
          },
          "& .MuiSlider-track": {
            color: "red",
          },
          "& .MuiSlider-rail": {
            color: "white",
          },
        }}
      />
    );
  };

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <UndoButton />
        <RedoButton />
        <CutButton />
        <DeleteButton />
        <CopyButton />
        <Box flexGrow={1} display="flex" justifyContent="center">
          <PlayPauseButton />
          <Timer />
        </Box>
        <ZoomOutButton />
        <ZoomInButton />
        <ZoomFitButton />
      </Toolbar>
      <Box overflow="hidden">
        <TimeSlider />
      </Box>
    </AppBar>
  );
};

export default TimelineBar;
