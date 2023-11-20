/**
 * SortableItem.tsx
 *
 * Description:
 * This module acts as a wrapper. Use this in SortableList to create a
 * sortable item. This wrapper renders the component provided in the
 * "content" propert.
 *
 */

import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";

import { TimelineItem } from "../TimelineContext";

function SortableItem(item: TimelineItem) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    flexGrow: item.length,
    flexShrink: 0,
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {item.content}
    </Box>
  );
}

export default SortableItem;
