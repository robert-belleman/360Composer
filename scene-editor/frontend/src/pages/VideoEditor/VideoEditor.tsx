/*
Filename: VideoEditor.tsx
Description: This file describes the contents of the video-editor page.
 */

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Box } from "@mui/material/";

import MediaLibrary from "../../components/VideoEditorComponents/MediaLibrary";
import Timeline from "../../components/VideoEditorComponents/Timeline";
import TitleBar from "../../components/VideoEditorComponents/TitleBar";
import VideoPreview from "../../components/VideoEditorComponents/VideoPreview";

/* UI settings */
const libraryWidth = 400;
const timelineHeight = 320;

const VideoEditor = () => {
  /* Initialize variables. */
  const [title, setTitle] = useState("");
  const [clips, setClips] = useState<any>([]);

  /* Append a clip to the clips array. */
  const appendClip = (clip: any) => {
    let newClips = clips.slice();
    newClips.push(clip);
    setClips(newClips);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <MediaLibrary callback={appendClip} width={libraryWidth} />
      <Box
        sx={{ width: 1, height: "100vh", display: "flex", flexFlow: "column" }}
      >
        <TitleBar title={title} setTitle={setTitle} />
        <VideoPreview />
        <Timeline clips={clips} height={timelineHeight} />
      </Box>
    </Box>
  );
};

export default VideoEditor;
