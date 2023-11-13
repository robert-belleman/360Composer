/**
 * VideoEditor.tsx
 *
 * Description:
 * This module combines the different Components of a video editor into a
 * React Functional Component. In addition, it wraps the Components in
 * ContextProviders so that the children can easily manipulate the state
 * using a `dispatch` instead of `lifting up state`.
 *
 * In the files related to the video editor will use the following terms:
 *   - Asset, an asset stored in the file system.
 *   - Clip, an asset with a start time and a duration.
 *   - Video edit, an ordered list of clips that may have parts cut off.
 *
 * The Video Editor has four main Components:
 *   - Title Bar
 *     - A Component where the user can change the title of their video edit.
 *     - Includes a button that allows the user to export their video edit.
 *   - Media Library
 *     - A library showing all assets belonging to the user.
 *     - A Component where the user can convert assets to clips.
 *   - Timeline
 *     - A place where the user can edit their clips.
 *     - Provides an overview of the ordering of all clips.
 *   - Video Player
 *     - A place where the current video edit is displayed.
 *
 * There are multiple custom Context modules used in this VideoEditor
 * Component. The Context modules are for:
 *   - Assets. Handles actions such as fetching or the conversion to clips.
 *   - Clips. Handles actions that manipulate a clip or the ordering of them.
 *
 */

import { Box } from "@mui/material";

import MediaLibrary from "../../components/VideoEditorComponents/MediaLibrary";
import Timeline from "../../components/VideoEditorComponents/Timeline";
import TitleBar from "../../components/VideoEditorComponents/TitleBar";
import VideoPreview from "../../components/VideoEditorComponents/VideoPreview";

import { AssetsProvider } from "../../components/VideoEditorComponents/AssetsContext";
import { ClipsProvider } from "../../components/VideoEditorComponents/ClipsContext";

const VideoEditor: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <ClipsProvider>
        <AssetsProvider>
          <MediaLibrary />
        </AssetsProvider>
        <Box
          sx={{
            flexGrow: 1,
            height: "100vh",
            display: "flex",
            flexFlow: "column",
          }}
        >
          <TitleBar />
          <VideoPreview />
          <Timeline />
        </Box>
      </ClipsProvider>
    </Box>
  );
};

export default VideoEditor;
