/**
 * VideoPreview.tsx
 *
 * Description:
 * This module describes the VideoPreview Component of the VideoEditor.
 *
 * The VideoPreview contains the following Components:
 *   - TODO
 *
 */

import React, { useCallback, useContext, useEffect, useState } from "react";

import {
  FreeCamera,
  HemisphericLight,
  Vector3,
  VideoDome,
} from "@babylonjs/core";
import "@babylonjs/loaders";

import { Box } from "@mui/material";

import Hls from "hls.js";
import { HlsContext } from "../../App";

import SceneComponent from "../../components/VideoEditorComponents/testComponent";

import { useClips } from "./ClipsContext";

const VideoPreview: React.FC = () => {
  const hls = useContext<Hls | undefined>(HlsContext);
  const [video, setVideo]: any = useState(undefined);

  const { clips } = useClips();

  useEffect(() => {
    if (clips.data.length > 0) {
      setVideo(clips.data[clips.data.length - 1].asset);
    }
  }, [clips.data.length]);

  // babylon variables
  const [babylonScene, setBabylonScene]: any = useState(undefined);
  const [babylonCamera, setBabylonCamera]: any = useState(undefined);
  var [videoDome, setVideoDome]: any = useState(undefined);

  // loads video when we have fetched the video data
  useEffect(() => {
    if (video !== undefined) loadVideo();
  }, [video]);

  const onVideoElemRef = useCallback(
    (videoElem) => {
      if (hls == undefined) {
        console.warn("HLS not available");
        return;
      }

      if (video !== undefined) {
        const hlsSource = `/assets/${video.path}`;
        if (Hls.isSupported()) {
          hls.loadSource(hlsSource);
          hls.attachMedia(videoElem);
        } else if (videoElem.canPlayType("application/vnd.apple.mpegurl")) {
          videoElem.src = hlsSource;
        } else {
          console.error("No HLS support");
        }

        loadVideoBabylon(videoElem);
      }
    },
    [hls, video]
  );

  const loadVideo = () => {
    return <video hidden ref={onVideoElemRef}></video>;
  };

  const loadVideoBabylon = (videoElem: HTMLVideoElement) => {
    if (videoDome !== undefined) {
      videoDome.dispose();
    }

    const posterURL = `/api/asset/${video.id}/thumbnail`;
    videoDome = new VideoDome(
      "videoDome",
      videoElem,
      {
        resolution: 32,
        clickToPlay: false,
        autoPlay: false,
        poster: posterURL,
        loop: true,
      },
      babylonScene
    );
    setVideoDome(videoDome);

    // make sure playback is updated
    videoDome.videoTexture.video.ontimeupdate = (event: any) => {};

    videoDome.videoTexture.video.onloadedmetadata = (event: any) => {
      setStereoscopic(video.view_type);
    };
  };

  const setStereoscopic = (mode: string) => {
    switch (mode) {
      case "ViewType.toptobottom":
        videoDome.videomode = VideoDome.MODE_TOPBOTTOM;
        break;
      case "ViewType.sidetoside":
        videoDome.videomode = VideoDome.MODE_SIDEBYSIDE;
        break;
      case "ViewType.mono":
        videoDome.videomode = VideoDome.MODE_MONOSCOPIC;
        break;
    }
  };

  // runs whenever the seen has been set up
  const onSceneReady = (scene: any) => {
    // keep track of scene to use it later
    setBabylonScene(scene);

    var camera = new FreeCamera("camera1", new Vector3(0, 0, 3), scene);
    // This targets the camera to scene origin
    camera.setTarget(new Vector3(0, 0, 0));
    camera.speed *= 0.2;
    const canvas = scene.getEngine().getRenderingCanvas();
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light = new HemisphericLight("light", new Vector3(0, 4, 0), scene);
    light.intensity = 1;

    setBabylonCamera(camera);
  };

  // gets called everytime a frame is rendered
  const onRender = (scene: any) => {};

  return (
    <Box flexGrow={1} border={2}>
      <div id="video-player">
        {loadVideo()}
        <SceneComponent
          antialias
          onSceneReady={onSceneReady}
          onRender={onRender}
          id="editorCanvas"
        ></SceneComponent>
      </div>
    </Box>
  );
};

export default VideoPreview;
