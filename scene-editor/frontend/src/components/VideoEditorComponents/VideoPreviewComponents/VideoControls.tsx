/**
 * VideoControls.tsx
 *
 * Description:
 * This React component represents a set of video control buttons, including
 * rewind, play/pause, and forward functionalities. It utilizes Material-UI's
 * IconButton and icons to provide a user interface for controlling video
 * playback.
 *
 * Props:
 *   - videoRef : React.RefObject<HTMLVideoElement>
 *     - Reference to the video element for control.
 *
 */

import React, { useCallback, useState } from "react";

import { Box, IconButton } from "@mui/material";

import Forward5Icon from "@mui/icons-material/Forward5";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay5Icon from "@mui/icons-material/Replay5";

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const handlePlayPause = useCallback(() => {
    const { current: videoElement } = videoRef;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }

      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  // TODO: handle < 0.
  const handleRewind5 = useCallback(() => {
    const { current: videoElement } = videoRef;
    if (videoElement) {
      videoElement.currentTime -= 5;
    }
  }, [videoRef]);

  // TODO: handle exceed video time.
  const handleForward5 = useCallback(() => {
    const { current: videoElement } = videoRef;
    if (videoElement) {
      videoElement.currentTime += 5;
    }
  }, [videoRef]);

  const RewindIconButton = React.memo(() => {
    return (
      <IconButton
        id="rewindButton"
        onClick={handleRewind5}
        color="primary"
        size="large"
        aria-label="Rewind 5 seconds"
      >
        <Replay5Icon />
      </IconButton>
    );
  });

  const PlayPauseIconButton = React.memo(() => {
    return (
      <IconButton
        id="playPauseButton"
        onClick={handlePlayPause}
        color="primary"
        size="large"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
    );
  });

  const ForwardIconButton = React.memo(() => {
    return (
      <IconButton
        id="forwardButton"
        onClick={handleForward5}
        color="primary"
        size="large"
        aria-label="Forward 5 seconds"
      >
        <Forward5Icon />
      </IconButton>
    );
  });

  return (
    <Box height="auto" display="flex" justifyContent="center">
      <RewindIconButton />
      <PlayPauseIconButton />
      <ForwardIconButton />
    </Box>
  );
};

export default VideoControls;
