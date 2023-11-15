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
 */

import React, { useContext, useEffect, useRef, useState } from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";

import { Box, Stack } from "@mui/material";

import VideoControls from "./VideoPreviewComponents/VideoControls";

import Hls from "hls.js";
import { HlsContext } from "../../App";

import { useVideoContext } from "./VideoContext";
import { useClipsContext } from "./ClipsContext";
import { MINIMUM_CLIP_LENGTH } from "./Constants";

const VideoPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hls = useContext<Hls | undefined>(HlsContext);
  const { state: clipsState } = useClipsContext();

  const [checkEnded, setCheckEnded] = useState(false);

  const {
    isPlaying,
    isSeeking,
    currentNode,
    currentTime,
    currentDuration,
    videoClipTime,
    videoClipTimePlayed,
    setIsPlaying,
    setIsSeeking,
    setCurrentNode,
    setCurrentTime,
    setVideoClipTime,
    setVideoClipTimePlayed,
  } = useVideoContext();

  /* Play the video clip. */
  const playVideoClip = (videoElem: HTMLVideoElement) => {
    if (currentDuration <= currentTime) {
      /* If play is clicked after finishing, then restart the entire video. */
      if (clipsState.clips.head) {
        setCurrentNode(clipsState.clips.head);
        setCurrentTime(0);
      }
      videoElem.load();
    } else {
      videoElem.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  /**
   * Play the next video clip.
   */
  const playNextVideoClip = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem) {
      console.error("Error loading video: Video element not available.");
      return;
    }

    /* If there is no next video clip, then stop. */
    if (!currentNode || !currentNode.next) {
      setIsPlaying(false);
      return;
    }

    // TODO: fix Error playing video: DOMException: The play() request was interrupted by a new load request.

    const timePlayed = currentNode.data.duration;
    setVideoClipTimePlayed(videoClipTimePlayed + timePlayed);

    /* Update the video clip variables. */
    const nextNode = currentNode.next;
    setCurrentNode(nextNode);
    const nextVideoClip = nextNode.data;
    videoElem.currentTime = nextVideoClip.startTime;
    setVideoClipTime(0);
  };

  /**
   * When the video clip changes, load the source.
   */
  useEffect(() => {
    const { current: videoElem } = videoRef;

    if (!currentNode || !videoElem || !hls) {
      /* `currentNode` or `videoElem` are not initialized at startup. */
      if (clipsState.clips.length != 0) {
        console.error(
          "Error loading video: Video element or HLS not available. Clip: ",
          currentNode
        );
      }
      return;
    }

    const currentClip = currentNode.data;
    const hlsSource = `/assets/${currentClip.asset.path}`;
    if (!hlsSource) {
      console.error(
        "Error loading video: HLS source URL is empty or undefined"
      );
      return;
    }

    const loadSrc = (source: string) => {
      const loadWithHls = () => {
        try {
          hls.loadSource(source);
          hls.attachMedia(videoElem);
          console.log("Loaded HLS source:", source);
        } catch (error) {
          console.error("Error loading video:", error);
        }
      };
      if (Hls.isSupported()) {
        loadWithHls();
      } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
        videoElem.src = source;
      } else {
        console.error("No HLS support");
      }
    };

    loadSrc(hlsSource);

    if (!isSeeking) videoElem.currentTime = currentClip.startTime;

    /* Only check if clip ended in onTimeUpdate if it is early enough. */
    const delta = currentNode.data.duration - videoElem.duration;
    setCheckEnded(MINIMUM_CLIP_LENGTH < delta);

    if (isPlaying) playVideoClip(videoElem);
  }, [currentNode, hls]);

  /**
   * Update time state variables on time update.
   */
  const onTimeUpdate = () => {
    const { current: videoElem } = videoRef;

    if (!videoElem || !currentNode) {
      console.error("Error: Video element not available");
      return;
    }

    /* Update state variables for time. */
    setVideoClipTime(videoElem.currentTime);
    setCurrentTime(videoElem.currentTime + videoClipTimePlayed);

    /* Ensure that it does not chain with onEnded(). */
    if (checkEnded) {
      /* If clip ended before source ended, play the next one. */
      const clipDuration = currentNode.data.duration;
      if (clipDuration <= videoClipTime) playNextVideoClip();
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
    playNextVideoClip();
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
    <Stack flexGrow={1} sx={{ backgroundColor: "slategray" }}>
      <Box flexGrow={1} border={2} borderColor="lightgreen">
        {currentNode && (
          <Scene embedded width="100%" height="100%">
            <Assets>
              <video
                id="360Video"
                ref={videoRef}
                autoPlay={false}
                loop={false}
                crossOrigin="anonymous"
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
              />
            </Assets>

            <Sky src="#360Video" />
          </Scene>
        )}
      </Box>

      <VideoControls videoRef={videoRef} play={playVideoClip} />
    </Stack>
  );
};

export default VideoPreview;
