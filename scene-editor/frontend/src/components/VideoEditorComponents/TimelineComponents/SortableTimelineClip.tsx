/**
 * SortableTimelineClip.tsx
 *
 * Description:
 * This component implements a horizontal sortable list using the DnD Kit library.
 * It displays a list of draggable items (clips) with the ability to reorder them
 * through drag-and-drop interactions. The order of items is reflected in both the
 * UI and the underlying data structure.
 *
 */

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clip, thumbnailUrl } from "../ClipsContext";
import { Box } from "@mui/material";
import { TIMELINE_CLIP_HEIGHT } from "../Constants";

export interface SortableTimelineClipProps {
  id: number;
  clip: Clip;
  width: number;
}

export function SortableTimelineClip(item: SortableTimelineClipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const toggleSelect = () => {
    item.clip.selected = !item.clip.selected;
    setIsSelected(!isSelected);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      height={TIMELINE_CLIP_HEIGHT}
      width={item.width}
      onClick={toggleSelect}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      boxSizing="border-box"
      border={4}
      borderColor={
        isSelected ? "lightgreen" : isHovered ? "gainsboro" : "transparent"
      }
      borderRadius={2}
      sx={{
        background: `url(${thumbnailUrl(item.clip)})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
      }}
    ></Box>
  );
}
