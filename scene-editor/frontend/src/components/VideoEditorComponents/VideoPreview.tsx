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

import React from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";

import { Box, Stack } from "@mui/material";

import VideoControls from "./VideoPreviewComponents/VideoControls";

import { useVideoContext } from "./VideoContext";

const VideoPreview: React.FC = () => {
  const { videoRef, isValidClipIndex } = useVideoContext();

  return (
    <Stack flexGrow={1} sx={{ backgroundColor: "slategray" }}>
      <Box flexGrow={1} border={2} borderColor="lightgreen">
        {isValidClipIndex() && (
          <Scene embedded width="100%" height="100%">
            <Assets>
              <video
                id="360Video"
                ref={videoRef}
                autoPlay={false}
                loop={false}
                crossOrigin="anonymous"
              />
            </Assets>

            <Sky src="#360Video" />
          </Scene>
        )}
      </Box>

      <VideoControls />
    </Stack>
  );
};

export default VideoPreview;
