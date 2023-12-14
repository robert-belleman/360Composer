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

import React, { useRef, useState } from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";
import { Box, Stack } from "@mui/material";

import { useVideoContext } from "../VideoContext";
import VideoControls from "./VideoControls";

const VideoPreview: React.FC = () => {
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [loadedMeta, setLoadedMeta] = useState(false);

  const { videoRef, handleTimeUpdate, handleEnded } = useVideoContext();

  /**
   * Update dimensions to maximize video area inside Box.
   * Update state to ley play() know it can play without buffer.
   */
  const handleLoadedMetadata = () => {
    setLoadedMeta(true);
  };

  return (
    <Stack flexGrow={1} sx={{ backgroundColor: "snow" }}>
      <Box ref={boxRef} width={1} height={1}>
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

      <VideoControls />
    </Stack>
  );
};

export default React.memo(VideoPreview);
