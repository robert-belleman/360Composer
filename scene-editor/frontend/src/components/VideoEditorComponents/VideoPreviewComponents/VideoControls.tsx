/**
 * VideoControls.tsx
 *
 * Description:
 * This React component represents a set of video control buttons, including
 * rewind, play/pause, and forward functionalities. It utilizes Material-UI's
 * IconButton and icons to provide a user interface for controlling video
 * playback.
 *
 */

import React from "react";

import { Box, IconButton } from "@mui/material";

import Forward5Icon from "@mui/icons-material/Forward5";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Replay5Icon from "@mui/icons-material/Replay5";
import { useVideoContext } from "../VideoContext";

type VideoControlsProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  play: (videoElem: HTMLVideoElement) => void;
};

const VideoControls: React.FC<VideoControlsProps> = ({ videoRef, play }) => {
  const { isPlaying, setIsPlaying } = useVideoContext();

  /**
   * Pause or resume playback of the video.
   */
  const togglePlayback = () => {
    const { current: videoElem } = videoRef;
    if (videoElem) {
      if (isPlaying) {
        videoElem.pause();
      } else {
        play(videoElem);
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Add or subtract a number of seconds to the current time.
   * @param delta The number of seconds to add or subtract.
   */
  const addTime = (delta: number) => {
    const { current: videoElement } = videoRef;
    if (videoElement) {
      const newTime = videoElement.currentTime + delta;
      const exceedClipEnd = newTime > videoElement.duration;
      const exceedClipStart = newTime < 0;
      if (exceedClipEnd) {
        // TODO: Handle exceed clip end
      } else if (exceedClipStart) {
        // TODO: Handle exceed clip start
      } else {
        videoElement.currentTime = newTime;
      }
    }
  };

  const RewindIconButton = React.memo(() => {
    return (
      <IconButton
        id="rewindButton"
        onClick={() => addTime(-5)}
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
        onClick={togglePlayback}
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
        onClick={() => addTime(5)}
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
