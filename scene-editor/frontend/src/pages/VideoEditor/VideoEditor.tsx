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
 *   - Video, the current Clip played on the VideoPreview Component.
 *   - Video edit, an array of Clips that are played in order.
 *
 * The Video Editor has four main Components:
 *   - Title Bar
 *     - Change the title of the video edit.
 *     - Export the video edit.
 *   - Media Library
 *     - Show assets in this project of the user.
 *     - Add assets as clips to the timeline.
 *   - Timeline
 *     - Edit clips by cutting, trimming, etc.
 *     - Provides an overview of the ordering of all clips.
 *   - Video Preview
 *     - Preview the current video edit.
 *
 * There are multiple custom Context modules used in this VideoEditor
 * Component. The Context modules are for:
 *   - Assets. Handles actions such as fetching or the conversion to clips.
 *   - Clips. Handles actions that manipulate a clip or the ordering of them.
 *   - Video. Handles actions that concern the current clip played.
 *
 */

/* Third Party Imports */
import { Box, Grid, Stack } from "@mui/material";

/* Component Imports */
import MediaLibrary from "../../components/VideoEditorComponents/MediaLibraryComponents/MediaLibrary";
import Timeline from "../../components/VideoEditorComponents/TimelineComponents/Timeline";
import TitleBar from "../../components/VideoEditorComponents/TitleBarComponents/TitleBar";
import VideoPreview from "../../components/VideoEditorComponents/VideoPreviewComponents/VideoPreview";

/* Context Imports */
import { ClipsProvider } from "../../components/VideoEditorComponents/ClipsContext";
import { AssetsProvider } from "../../components/VideoEditorComponents/MediaLibraryComponents/AssetsContext";
import { TimelineSettingsProvider } from "../../components/VideoEditorComponents/TimelineComponents/TimelineContext";
import { VideoProvider } from "../../components/VideoEditorComponents/VideoContext";

const VideoEditor: React.FC = () => {
  return (
    <Grid container>
      <ClipsProvider>
        <AssetsProvider>
          <Grid item xs={3}>
            <MediaLibrary />
          </Grid>
          <Grid item xs={9}>
            <Stack height="100vh">
              <TitleBar />
              <VideoProvider>
                <Stack height={1} display="flex" justifyContent="flex-end">
                  <VideoPreview />
                  <TimelineSettingsProvider>
                    <Timeline />
                  </TimelineSettingsProvider>
                </Stack>
              </VideoProvider>
            </Stack>
          </Grid>
        </AssetsProvider>
      </ClipsProvider>
    </Grid>
  );
};

export default VideoEditor;
