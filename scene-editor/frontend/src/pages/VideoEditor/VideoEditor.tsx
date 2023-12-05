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
 *   - Asset, a 'project asset' from the database.
 *   - Clip, a wrapper around an Asset with a start time and a duration.
 *   - Video, the current edit (all clips combined).
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
 *   - Assets
 *     - Handles actions such as fetching or the conversion to clips.
 *     - Contains functions to filter and sort through the assets.
 *   - Clips
 *     - Handles actions to logically change the state of clips.
 *     - Contains functions that can be usefull for working with clips.
 *   - Video
 *     - Handles actions that concern the video on the preview component.
 *     - Actions could be playing, seeking, keeping track of current time, etc.
 *     - Contains functions to seek to a certain time or play the next video.
 *   - Timeline.
 *     - Handles actions that concern the state of the timeline.
 *     - There is state for the items on it, the scale of it and the slider.
 *
 */

import React, { useState } from "react";

import { Box, Drawer, Grid, Stack, useTheme } from "@mui/material";

import MediaLibrary from "../../components/VideoEditorComponents/MediaLibraryComponents/MediaLibrary";
import Timeline from "../../components/VideoEditorComponents/TimelineComponents/Timeline";
import TitleBar from "../../components/VideoEditorComponents/TitleBarComponents/TitleBar";
import VideoPreview from "../../components/VideoEditorComponents/VideoPreviewComponents/VideoPreview";

import { ClipsProvider } from "../../components/VideoEditorComponents/ClipsContext";
import { AssetsProvider } from "../../components/VideoEditorComponents/MediaLibraryComponents/AssetsContext";
import { TimelineSettingsProvider } from "../../components/VideoEditorComponents/TimelineComponents/TimelineContext";
import { VideoProvider } from "../../components/VideoEditorComponents/VideoContext";

const VideoEditor: React.FC = () => {
  const theme = useTheme();
  const [showMediaLibrary, setShowMediaLibrary] = useState(true);

  const toggleMediaLibrary = () => {
    setShowMediaLibrary(!showMediaLibrary);
  };

  const anchor = theme.breakpoints.down("sm") ? "bottom" : "left";

  /* Size of the drawer depending on device size. Note the anchor point. */
  const getDrawerStyles = () => ({
    width: { xs: "100%", sm: "100%", md: "35%", lg: "30%", xl: "25%" },
    height: { xs: "60%", sm: "60%", md: "100%", lg: "100%", xl: "100%" },
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: { xs: "100%", sm: "100%", md: "35%", lg: "30%", xl: "25%" },
      height: { xs: "60%", sm: "60%", md: "100%", lg: "100%", xl: "100%" },
      boxSizing: "border-box",
    },
  });

  const getMainContentStyles = () => ({
    width: "100%",

    /* Offset the main content to allow the drawer and content to co-exist. */
    [theme.breakpoints.up("md")]: {
      marginLeft: showMediaLibrary ? getDrawerStyles().width.md : 0,
    },
    [theme.breakpoints.up("lg")]: {
      marginLeft: showMediaLibrary ? getDrawerStyles().width.lg : 0,
    },
    [theme.breakpoints.up("xl")]: {
      marginLeft: showMediaLibrary ? getDrawerStyles().width.xl : 0,
    },
  });

  const renderMediaLibraryDrawer = () => (
    <Drawer
      anchor={anchor}
      variant="persistent"
      open={showMediaLibrary}
      onClose={toggleMediaLibrary}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={getDrawerStyles()}
    >
      <MediaLibrary />
    </Drawer>
  );

  const renderMainContentArea = () => (
    <Box sx={getMainContentStyles()}>
      <Stack height="100vh">
        <VideoProvider>
          <TitleBar toggleMediaLibrary={toggleMediaLibrary} />

          <Stack height={1}>
            <VideoPreview />
            <TimelineSettingsProvider>
              <Timeline />
            </TimelineSettingsProvider>
          </Stack>
        </VideoProvider>
      </Stack>
    </Box>
  );

  return (
    <Grid container>
      <ClipsProvider>
        <AssetsProvider>
          {renderMediaLibraryDrawer()}
          {renderMainContentArea()}
        </AssetsProvider>
      </ClipsProvider>
    </Grid>
  );
};

export default VideoEditor;
