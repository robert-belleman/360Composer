/**
 * VideoPreview.tsx
 * Description:
 * This file defines the VideoPreview component, which displays a video preview
 * using A-Frame and MUI components.
 *
 * Components:
 * - VideoPreview: The main component rendering the video preview using
 *   A-Frame, MUI, and HLS.js. It loads and plays videos based on the
 *   clips provided by the ClipsContext.
 *
 * Dependencies:
 * - @belivvr/aframe-react: A-Frame library for building virtual reality experiences.
 * - hls.js: JavaScript library for HTTP Live Streaming (HLS).
 * - @mui/material: Material-UI components for the user interface.
 *
 */

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Assets, Scene, Sky } from "@belivvr/aframe-react";

import Hls from "hls.js";
import { HlsContext } from "../../App";

import { Box, Stack, Typography } from "@mui/material";

import VideoControls from "./VideoPreviewComponents/VideoControls";

import { Asset } from "./AssetsContext";
import { useClips } from "./ClipsContext";

const VideoPreview: React.FC = () => {
  const hls = useContext<Hls | undefined>(HlsContext);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { clips } = useClips();
  const [video, setVideo] = useState<Asset>();

  useEffect(() => {
    // TODO: remove this and setVideo based on currentTime.
    if (clips.data.length > 0) {
      setVideo(clips.data[clips.data.length - 1].asset);
    }
  }, [clips.data.length]);

  const onVideoElemRef = useCallback(
    (videoElem: HTMLVideoElement | null) => {
      if (!videoElem || !hls) {
        console.warn("Video element or HLS not available");
        return;
      }

      if (video === undefined) {
        return;
      }

      const hlsSource = `/assets/${video.path}`;

      if (Hls.isSupported()) {
        try {
          hls.loadSource(hlsSource);
          hls.attachMedia(videoElem);
        } catch (error) {
          console.error("Error loading video:", error);
        }
      } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
        videoElem.src = hlsSource;
      } else {
        console.error("No HLS support");
      }
    },
    [video, hls]
  );

  // Load and play the video when the component mounts or the video prop changes
  useEffect(() => {
    if (videoRef.current) {
      onVideoElemRef(videoRef.current);
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }, [onVideoElemRef, video]);

  if (video === undefined) {
    return <Typography>no clips added</Typography>;
  }

  return (
    <Stack flexGrow={1} sx={{ backgroundColor: "slategray" }}>
      <Box flexGrow={1} border={2} borderColor="lightgreen">
        <Scene embedded width="100%" height="100%">
          <Assets>
            <video
              id="360Video"
              ref={videoRef}
              autoPlay
              loop
              crossOrigin="anonymous"
            />
          </Assets>

          <Sky src="#360Video" />
        </Scene>
      </Box>

      <VideoControls videoRef={videoRef} />
    </Stack>
  );
};

export default VideoPreview;
