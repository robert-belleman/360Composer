/**
 * VideoPreview.tsx
 * Description:
 * This file defines the VideoPreview Component, which displays a video preview
 * using A-Frame and MUI Components.
 *
 * Components:
 * - VideoPreview: The main Component rendering the video preview using A-Frame.
 * - VideoControls: A Component containing video playback controls.
 *
 * TODO potential performance improvements
 *  - lazy loading
 *  - optimize video size and resolution
 *  - caching
 *
 */

import React, { useContext, useEffect, useRef, useState } from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";

import { Box, Stack } from "@mui/material";

import VideoControls from "./VideoControls";

import Hls from "hls.js";
import { HlsContext } from "../../../App";

import { Clip, useClipsContext } from "../ClipsContext";
import { MINIMUM_CLIP_LENGTH } from "../Constants";
import { useVideoContext } from "../VideoContext";

const VideoPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [loadedMeta, setLoadedMeta] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 1, height: 1 });

  const hls = useContext<Hls | undefined>(HlsContext);
  const { state: clipsState } = useClipsContext();

  const {
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
    seek,
  } = useVideoContext();

  const loadVideo = (videoElem: HTMLVideoElement, hls: Hls, clip: Clip) => {
    const hlsSource = `/assets/${clip.asset.path}`;
    if (!hlsSource) {
      console.error(
        "Error loading video: HLS source URL is empty or undefined"
      );
      return;
    }

    const loadWithHls = (source: string) => {
      try {
        hls.loadSource(source);
        hls.attachMedia(videoElem);
        console.log("Loaded HLS source:", source);
      } catch (error) {
        console.error("Error loading video:", error);
      }
    };

    const loadSource = (source: string) => {
      if (Hls.isSupported()) {
        loadWithHls(source);
      } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
        videoElem.src = source;
      } else {
        console.error("No HLS support");
      }
    };

    loadSource(hlsSource);
  };

  /**
   * When the video clip changes, load the source.
   */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    if (currentIndex === null || !videoElem || !hls) {
      if (clipsState.clips.length != 0) {
        console.error(
          "Error loading video: Video element or HLS not available."
        );
      }
      return;
    }

    const currentClip = clipsState.clips[currentIndex];
    loadVideo(videoElem, hls, currentClip);

    if (!isSeeking) videoElem.currentTime = currentClip.startTime;

    if (reloading) {
      seek(currentTime);
      setReloading(false);
    }

    if (isPlaying) play(videoElem);
  }, [currentIndex, hls, reloading]);

  /**
   * Update the dimensions of the Box to maximize video size while maintaining
   * its aspect ratio.
   */
  const updateDimensions = () => {
    const { current: videoElem } = videoRef;
    const { current: boxElem } = boxRef;

    if (!videoElem || !boxElem) {
      console.error("Error loading video: Video element or HLS not available.");
      return;
    }

    const videoAspectRatio = videoElem.videoWidth / videoElem.videoHeight;
    const boxAspectRatio = boxElem.clientWidth / boxElem.clientHeight;

    let width;
    let height;

    if (videoAspectRatio > boxAspectRatio) {
      // Video is wider than the box
      width = boxElem.clientWidth;
      height = width / videoAspectRatio;
    } else {
      // Video is taller than or equal to the box
      height = boxElem.clientHeight;
      width = height * videoAspectRatio;
    }
    setVideoSize({ width, height });
  };

  /**
   * Whenever the window resizes, update the dimensions of the Box.
   */
  useEffect(() => {
    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  /**
   * Update dimensions to maximize video area inside Box.
   * Update state to ley play() know it can play without buffer.
   */
  const onLoadedMetadata = () => {
    updateDimensions();
    setLoadedMeta(true);
  };

  /**
   * Update time state variables on time update.
   */
  const onTimeUpdate = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem || currentIndex === null) {
      console.error("Error: Video element not available");
      return;
    }

    /* Update state variables for time. */
    setVideoClipTime(videoElem.currentTime);
    setCurrentTime(videoElem.currentTime + videoClipTimePlayed);

    const currentClip = clipsState.clips[currentIndex];
    /* If the duration of the clip has been exceeded, play the next clip. */
    if (currentClip.duration <= videoElem.currentTime) {
      /* Try not to overlap with the onEnded() function. */
      const delta = currentClip.asset.duration - currentClip.duration;
      const overlapping = delta < MINIMUM_CLIP_LENGTH;
      if (!overlapping) playNext(videoElem);
    }
  };

  /**
   * Play the next video clip if the video source ends.
   */
  const onEnded = () => {
    const { current: videoElem } = videoRef;
    if (!videoElem) {
      console.error("Error: Video element not available");
      return;
    }
    playNext(videoElem);
  };

  /**
   * If someone seeks a specific time in the slider, go to it.
   */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    if (isSeeking && videoElem) {
      videoElem.currentTime = videoClipTime;
      setIsSeeking(false);
    }
  }, [isSeeking]);

  return (
    <Stack flexGrow={1} sx={{ backgroundColor: "snow" }}>
      <Box ref={boxRef} width={1} height={1}>
        <Box
          margin="auto"
          boxSizing="border-box"
          border="2px solid lightgreen"
          width={videoSize.width}
          height={videoSize.height}
        >
          <Scene embedded>
            <Assets>
              <video
                id="360Video"
                ref={videoRef}
                autoPlay={false}
                loop={false}
                crossOrigin="anonymous"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                src="" // Set an empty placeholder.
              />
            </Assets>
            {loadedMeta && <Sky src="#360Video" />}
          </Scene>
        </Box>
      </Box>

      <VideoControls videoRef={videoRef} />
    </Stack>
  );
};

export default VideoPreview;
