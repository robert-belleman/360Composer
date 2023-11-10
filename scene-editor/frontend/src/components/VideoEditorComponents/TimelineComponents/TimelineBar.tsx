/*
Filename: Timeline.tsx
Description:
This file describes timeline bar component of the video editor.
It contains buttons to modify the timeline and displays the
current time and total time of all media on the timeline.
 */

import React, { useState, useEffect } from "react";

import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";

import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Clips from "../Classes/Clips";

type TimelineBarProps = {
  clips: Clips;
  setClips: React.Dispatch<React.SetStateAction<Clips>>;
};

const TimelineBar: React.FC<TimelineBarProps> = ({ clips, setClips }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  /* Compute the total time of all clips when it changes. */
  useEffect(() => {
    setTotalTime(clips.data.reduce((acc, clip) => acc + clip.getDuration(), 0));
  }, [clips]);

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
      <IconButton onClick={() => console.log(clips.seek(3))}>
        <ContentCopyIcon />
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
      <Typography color={"black"} sx={{ flexGrow: 1, textAlign: "center" }}>
        {strCurrentTime}/{strTotalTime}
      </Typography>
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
        <Timer />
        <ZoomOutButton />
        <ZoomInButton />
        <ZoomFitButton />
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(TimelineBar);
