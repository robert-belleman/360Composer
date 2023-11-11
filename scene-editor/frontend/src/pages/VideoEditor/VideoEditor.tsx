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
import Clip from "../../components/VideoEditorComponents/Classes/Clip";
import Clips from "../../components/VideoEditorComponents/Classes/Clips";

const VideoEditor = () => {
  /* Initialize variables. */
  const [title, setTitle] = useState("");
  const [clips, setClips] = useState<Clips>(new Clips());

  return (
    <Box sx={{ display: "flex" }}>
      <MediaLibrary clips={clips} setClips={setClips} />
      <Box
        sx={{ flexGrow: 1, height: "100vh", display: "flex", flexFlow: "column" }}
      >
        <TitleBar title={title} setTitle={setTitle} />
        <VideoPreview />
        <Timeline clips={clips} setClips={setClips} />
      </Box>
    </Box>
  );
};

export default VideoEditor;
