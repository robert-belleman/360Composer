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
 *  - caching
 *
 */

import React, { useEffect, useRef, useState } from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";
import { Box, Stack } from "@mui/material";

import { useVideoContext } from "../VideoContext";
import VideoControls from "./VideoControls";

const VideoPreview: React.FC = () => {
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [loadedMeta, setLoadedMeta] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 1, height: 1 });

  const { videoRef, handleTimeUpdate, handleEnded } = useVideoContext();

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
  const handleLoadedMetadata = () => {
    updateDimensions();
    setLoadedMeta(true);
  };

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
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                src="" // Set an empty placeholder.
              />
            </Assets>
            {loadedMeta && <Sky src="#360Video" />}
          </Scene>
        </Box>
      </Box>

      <VideoControls />
    </Stack>
  );
};

export default VideoPreview;
