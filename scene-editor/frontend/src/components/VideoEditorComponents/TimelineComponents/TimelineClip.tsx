/**
 * TimelineClip.tsx
 *
 * Description:
 * This module describes the TimelineClip Component of the Timeline.
 * This file mostly focuses on the rendering of a single clip.
 *
 * TODO: implement drag and drop for user experience.
 *
 */

import React, { useState } from "react";

import { Box } from "@mui/material";

import { TIMELINE_CLIP_HEIGHT } from "../Constants";

import {
  Clip,
  SELECT_CLIP,
  thumbnailUrl,
  useClipsContext,
} from "../ClipsContext";
import { DLLNode } from "../DoublyLinkedList";

type TimelineClipProps = {
  node: DLLNode<Clip>;
  visibleLength: number;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ node, visibleLength }) => {
  /* Use a state to rerender the component on change. */
  const [showBorder, setShowBorder] = useState(node.data.selected);

  const { dispatch } = useClipsContext();

  const handleClick = (node: DLLNode<Clip>) => {
    dispatch({ type: SELECT_CLIP, payload: { clip: node.data } });
    setShowBorder(node.data.selected);
  };

  return (
    <Box
      boxSizing={"border-box"}
      height={TIMELINE_CLIP_HEIGHT}
      flexGrow={visibleLength}
      flexBasis={0}
    >
      <Box
        width={1}
        height={1}
        boxSizing={"border-box"}
        border={3}
        onClick={() => handleClick(node)}
        sx={{
          background: `url(${thumbnailUrl(node.data)})`,
          backgroundRepeat: "repeat",
          backgroundSize: "contain",
          border: 4,
          borderRadius: 2,
          borderColor: showBorder ? "LightGreen" : "transparent",
        }}
      ></Box>
    </Box>
  );
};

export default TimelineClip;
