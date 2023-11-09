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
  /* Initialize variables from the URL. */
  const { projectID } = useParams();

  /* Initialize variables. */
  const [title, setTitle] = useState("");
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch all assets that are in project `projectID`.
   *
   * Set the `isLoading` variable to true.
   * Assign the assets to the `assets` variable.
   * Set the `isLoading` variable to false.
   */
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/project/${projectID}/assets`, {});
      setAssets(res.data);
      return setIsLoading(false);
    } catch (e) {
      return console.log("error while fetching assets", e);
    }
  };

  /* Fetch the assets. */
  useEffect(() => {
    fetchAssets();
  }, [projectID]);

  return (
    <Box sx={{ display: "flex" }}>
      <MediaLibrary assets={assets} loading={isLoading} width={libraryWidth} />
      <Box
        sx={{ width: 1, height: "100vh", display: "flex", flexFlow: "column" }}
      >
        <TitleBar projectID={projectID} title={title} setTitle={setTitle} />
        <VideoPreview />
        <Timeline height={timelineHeight} assets={assets} />
      </Box>
    </Box>
  );
};

export default VideoEditor;
