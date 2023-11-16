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

import React from "react";

import { Box } from "@mui/material";

import { TIMELINE_CLIP_HEIGHT } from "../Constants";

import { Clip, thumbnailUrl } from "../ClipsContext";
import { DLLNode } from "../DoublyLinkedList";
import { useTimelineContext } from "./TimelineContext";

type TimelineClipProps = {
  node: DLLNode<Clip>;
  visibleLength: number;
};

const TimelineClip: React.FC<TimelineClipProps> = ({ node, visibleLength }) => {
  const { selected, setSelected } = useTimelineContext();

  const handleClick = (node: DLLNode<Clip>) => {
    if (node.selected) {
      setSelected(selected - 1);
    } else {
      setSelected(selected + 1);
    }
    node.selected = !node.selected;
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
          borderColor: node.selected ? "LightGreen" : "transparent",
        }}
      ></Box>
    </Box>
  );
};

export default TimelineClip;
