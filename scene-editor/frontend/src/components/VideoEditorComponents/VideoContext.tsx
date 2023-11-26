/**
 * VideoContext.tsx
 *
 * Description:
 * This file defines a React Context for the video, which is all the video
 * clips in the timeline combined. The context, VideoContext, encapsulates
 * the state of video clips between different files. All functions and
 * effect that change the state of the video should be defined here.
 *
 * Examples:
 * - play(): attempt to play the current video source.
 * - seek(): seek to a certain time in the video (all clips).
 *
 */

import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { seekIndex, useClipsContext } from "./ClipsContext";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  isSeeking: boolean;
  reloading: boolean;
  currentIndex: number | null;
  currentTime: number;
  currentDuration: number;
  videoClipTime: number;
  videoClipTimePlayed: number;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setIsSeeking: Dispatch<SetStateAction<boolean>>;
  setReloading: Dispatch<SetStateAction<boolean>>;
  setCurrentIndex: Dispatch<SetStateAction<number | null>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  setVideoClipTime: Dispatch<SetStateAction<number>>;
  setVideoClipTimePlayed: Dispatch<SetStateAction<number>>;
  play: (videoElem: HTMLVideoElement) => void;
  playNext: () => void;
  reset: () => void;
  seek: (time: number) => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

const VideoProvider: React.FC = ({ children }) => {
  /* Reference to the HTMLVideoElement. */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /* Indicate when playback of the video changes. */
  const [isPlaying, setIsPlaying] = useState(false);
  /* Indicate when time is changed and things like ontimeupdate should stop. */
  const [isSeeking, setIsSeeking] = useState(false);
  /* Set to true if you want to forec reload the current source. */
  const [reloading, setReloading] = useState(false);
  /* Index of the current clip in the clips array. */
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  /* Indicate the current time in the video (all clips). */
  const [currentTime, setCurrentTime] = useState(0);
  /* Indicate the full duration of the video (all clips). */
  const [currentDuration, setCurrentDuration] = useState(0);

  /* Indicate the current time in the current clip. */
  const [videoClipTime, setVideoClipTime] = useState(0);
  /* Indicate the amount of time that has already been played before clip. */
  const [videoClipTimePlayed, setVideoClipTimePlayed] = useState(0);

  const { state: clipsState } = useClipsContext();

  /* After any changes to the length, start on the head. */
  useEffect(() => {
    if (clipsState.clips.length === 1) {
      seek(0);
    } else if (clipsState.clips.length > 1) {
      seek(currentTime);
    }
  }, [clipsState.clips.length]);

  /* If the total time changes, update the state of the total time. */
  useEffect(() => {
    setCurrentDuration(clipsState.totalDuration);
  }, [clipsState.totalDuration]);

  /**
   * Play the video of `videoElem`. If the video ended, restart from time = 0.
   * @param videoElem element to play video of.
   */
  const play = (videoElem: HTMLVideoElement) => {
    const onCanPlay = () => {
      videoElem.removeEventListener("canplay", onCanPlay);
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    };

    /* Do not do anything when play is requested without any video source. */
    if (!videoElem.currentSrc) {
      console.error("No available sources for the video.");
      return;
    }

    // Check if the video is ready to play
    if (videoElem.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      // The video is ready to play, no need to wait for 'canplay'
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    } else {
      // Wait for the 'canplay' event before attempting to play
      videoElem.addEventListener("canplay", onCanPlay);
    }
  };

  /**
   * Play the next video clip. If there is no next clip, stop playing.
   */
  const playNext = () => {
    const { current: videoElem } = videoRef;
    if (!videoElem) return

    /* If there is no next video clip, then stop. */
    if (currentIndex === null || currentIndex === clipsState.clips.length - 1) {
      setIsPlaying(false);
      videoElem.pause();
      return;
    }

    /* Seek to the start of next clip. */
    seek(videoClipTimePlayed + clipsState.clips[currentIndex].duration);
  };

  /**
   * Reset to the start of the video.
   */
  const reset = () => {
    if (clipsState.clips.length) {
      seek(0);
    }
  };

  /**
   * Go to a specific time in the entire video (all clips).
   * @param time time to got to.
   */
  const seek = (time: number) => {
    const { index, timeInClip } = seekIndex(clipsState, time);

    if (index !== null) {
      setIsSeeking(true);
      setVideoClipTimePlayed(time - timeInClip);
      setVideoClipTime(timeInClip);
      setCurrentIndex(index);
      setCurrentTime(time);
    } else if (clipsState.clips.length > 0 && time < 0) {
      /* If the time exceeds the minimum duration, skip to start. */
      setIsSeeking(true);
      setVideoClipTimePlayed(0);
      setVideoClipTime(0);
      setCurrentTime(0);
      setCurrentIndex(clipsState.clips ? 0 : null);
    } else if (clipsState.clips.length > 0 && time > clipsState.totalDuration) {
      /* If the time exceeds the maximum duration, skip to end. */
      const lastIndex = clipsState.clips.length - 1;
      const lastClip = clipsState.clips[lastIndex];
      setIsSeeking(true);
      setCurrentTime(clipsState.totalDuration);
      setVideoClipTimePlayed(clipsState.totalDuration - lastClip.duration);
      setVideoClipTime(lastClip.duration);
      setCurrentIndex(lastIndex);
    }
  };

  /**
   * If someone seeks a specific time in the slider, go to it.
   */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    if (isSeeking && videoElem) {
      videoElem.currentTime = videoClipTime;
      setIsSeeking(false);
      if (isPlaying) play(videoElem);
    }
  }, [isSeeking]);

  const value: VideoContextProps = {
    videoRef,
    isPlaying,
    isSeeking,
    reloading,
    currentIndex,
    currentTime,
    currentDuration,
    videoClipTime,
    videoClipTimePlayed,
    setIsPlaying,
    setIsSeeking,
    setReloading,
    setCurrentIndex,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
    play,
    playNext,
    reset,
    seek,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

const useVideoContext = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideoContext must be used within a VideoProvider");
  }
  return context;
};

export { VideoProvider, useVideoContext };
