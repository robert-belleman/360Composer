/**
 * VideoContext.tsx
 *
 * Description:
 * This file defines a React Context for the video, which is all the video
 * clips in the timeline combined. The context, VideoContext, encapsulates
 * the state of video clips between different files. All functions and
 * effect that change the state of the video should be defined here.
 *
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Hls from "hls.js";
import { HlsContext } from "../../App";
import { Clip, seekIndex, useClipsContext } from "./ClipsContext";
import { MINIMUM_CLIP_LENGTH } from "./Constants";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  videoIndex: number | null;
  videoTime: number;
  videoDuration: number;
  videoPlayedClipsDuration: number;
  playVideo: () => void;
  nextVideo: () => void;
  resetVideo: () => void;
  reloadVideo: () => void;
  seek: (time: number) => void;
  handleTogglePlayback: () => void;
  handleVideoDeleted: () => void;
  handleTimeUpdate: () => void;
  handleEnded: () => void;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

const VideoProvider: React.FC = ({ children }) => {
  /* Reference to the HTMLVideoElement. */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /* Indicate if the video is playing. */
  const [isPlaying, setIsPlaying] = useState(false);
  /* Indicate the video's index in the clips array. */
  const [videoIndex, setVideoIndex] = useState<number | null>(null);
  /* Indicate current time in the video (all clips). */
  const [videoTime, setVideoTime] = useState(0);
  /* Indicate total time of the video (all clips). */
  const [videoDuration, setVideoDuration] = useState(0);
  /* Indicate total time of completed clips before the current index. */
  const [videoPlayedClipsDuration, setVideoPlayedClipsDuration] = useState(0);

  const { state: clipsState, dispatch } = useClipsContext();
  const hls = useContext<Hls | undefined>(HlsContext);

  // TODO: TEMP
  useEffect(() => {
    if (clipsState.clips.length === 1) {
      setVideoIndex(0);
      loadVideo(clipsState.clips[0]);
    }
  }, [clipsState.clips.length]);

  /* If the total time changes, update the state of the total time. */
  useEffect(() => {
    setVideoDuration(clipsState.totalDuration);
  }, [clipsState.totalDuration]);

  /**
   * Load the video source of the clip `clip`. The video element will start
   * playback at the start time indicated by the Clip object. If an offset
   * is given, then the video element starts at the sum of the start time
   * and the offset. In summary, if you want to start playback `x` seconds
   * into the clip `clip`, then `offset` should be set to `x`.
   * @param clip clip to load.
   * @param offset time in the clip to start on.
   */
  const loadVideo = async (clip: Clip | null, offset: number = 0) => {
    const { current: videoElem } = videoRef;

    if (!videoElem || !hls || clip === null) {
      console.error("Error loading video: Video element or HLS unavailable.");
      return;
    }

    /* Use HLS source if exists, otherwise use normal source. */
    const sourcePath = clip.asset.hls_path || clip.asset.path;
    const source = `/assets/${sourcePath}`;
    if (clip.asset.hls_path) {
      if (Hls.isSupported()) {
        hls.loadSource(source);
        hls.attachMedia(videoElem);
        console.log(`Loaded HLS source: ${source}`);
      } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
        videoElem.src = source;
        console.log(`Loaded HLS source: ${source}`);
      }
    } else {
      videoElem.src = source;
      console.log(`Loaded video source: ${source}`);
    }

    videoElem.currentTime = clip.startTime + offset;

    if (isPlaying) playVideo();
  };

  /**
   * Play the video when enough data has loaded.
   */
  const playVideo = () => {
    const { current: videoElem } = videoRef;
    if (!videoElem) return;

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
  const nextVideo = () => {
    if (videoIndex !== null && videoIndex < clipsState.clips.length - 1) {
      const duration = clipsState.clips[videoIndex].duration;
      const newIndex = videoIndex + 1;
      setVideoPlayedClipsDuration(videoPlayedClipsDuration + duration);
      setVideoIndex(newIndex);
      loadVideo(clipsState.clips[newIndex]);
      return;
    }

    const { current: videoElem } = videoRef;
    if (!videoElem) return;

    setIsPlaying(false);
    videoElem.pause();
  };

  /**
   * Reset to the start of the video.
   * @param play if true, then play the video after resetting.
   */
  const resetVideo = async (play: boolean = false) => {
    setVideoPlayedClipsDuration(0);
    setVideoTime(0);
    setVideoIndex(0);
    await loadVideo(clipsState.clips[0], 0);
    if (play) playVideo();
  };

  /**
   * Reload the video after changes have been made in the order of the clips.
   *
   * NOTE: this function should be called frmo a useEffect() to ensure that
   * the clips array has been updated.
   */
  const reloadVideo = () => {
    seek(videoTime);
  };

  /**
   * Go to a specific time in the entire video (all clips).
   * @param time time to got to.
   */
  const seek = (time: number) => {
    const { current: videoElem } = videoRef;
    if (!videoElem || clipsState.clips.length === 0) return;

    const { index, timeInClip } = seekIndex(clipsState, time);
    if (index !== null) {
      const currentClip = clipsState.clips[index];
      setVideoPlayedClipsDuration(time - timeInClip);
      setVideoTime(time);
      setVideoIndex(index);
      loadVideo(currentClip, timeInClip);
    } else if (time <= 0) {
      /* If the time exceeds the minimum duration, skip to start. */
      const firstClip = clipsState.clips[0];
      setVideoPlayedClipsDuration(0);
      setVideoTime(0);
      setVideoIndex(clipsState.clips ? 0 : null);
      loadVideo(firstClip, 0);
    } else if (time >= clipsState.totalDuration) {
      /* If the time exceeds the maximum duration, skip to end. */
      const lastIndex = clipsState.clips.length - 1;
      const lastClip = clipsState.clips[lastIndex];
      setVideoPlayedClipsDuration(clipsState.totalDuration - lastClip.duration);
      setVideoTime(clipsState.totalDuration);
      setVideoIndex(lastIndex);
      loadVideo(lastClip, lastClip.duration);
    }
  };

  /**
   * Pause or resume playback of the video.
   */
  const handleTogglePlayback = () => {
    const { current: videoElem } = videoRef;
    if (!videoElem) return;

    if (videoElem.currentSrc) setIsPlaying(!isPlaying);

    if (videoDuration <= videoTime) {
      resetVideo(true);
    } else if (isPlaying) {
      videoElem.pause();
    } else {
      playVideo();
    }
  };

  /**
   * When a video is deleted, handle the update of related states.
   */
  const handleVideoDeleted = () => {
    setVideoIndex(null);
  };

  /**
   * Update time state variables on time update.
   */
  const handleTimeUpdate = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem || videoIndex === null) {
      console.error("Error: Video element not available");
      return;
    }

    /* Update state variables for time. */
    const currentClip = clipsState.clips[videoIndex];
    const currentClipTime = videoElem.currentTime - currentClip.startTime;
    setVideoTime(currentClipTime + videoPlayedClipsDuration);

    /* If the duration of the clip has been exceeded, play the next clip. */
    if (currentClip.duration <= currentClipTime) {
      /* Try not to overlap with the onEnded() function. */
      const delta = currentClip.asset.duration - currentClip.duration;
      const overlapping = delta < MINIMUM_CLIP_LENGTH;
      if (!overlapping) nextVideo();
    }
  };

  /**
   * When a video clip ends, attempt to play the next one.
   */
  const handleEnded = () => {
    nextVideo();
  };

  const value: VideoContextProps = {
    videoRef,
    isPlaying,
    videoIndex,
    videoTime,
    videoDuration,
    videoPlayedClipsDuration,
    playVideo,
    nextVideo,
    resetVideo,
    reloadVideo,
    seek,
    handleTogglePlayback,
    handleVideoDeleted,
    handleTimeUpdate,
    handleEnded,
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
