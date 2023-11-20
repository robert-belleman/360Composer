/**
 * TimelineClip.tsx
 *
 * Description:
 * This Component describes the appearance of a clip in the timeline.
 *
 */
import React, { useState } from "react";
import { Clip, thumbnailUrl } from "../../ClipsContext";
import { Box } from "@mui/material";
import { TIMELINE_CLIP_HEIGHT } from "../../Constants";

function TimelineClip({ clip, scale }: { clip: Clip; scale: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [, forceUpdate] = useState<{}>();

  const toggleSelect = () => {
    clip.selected = !clip.selected;
    forceUpdate({}); // Update to see color change.
  };

  return (
    <Box
      width={clip.duration * scale}
      height={TIMELINE_CLIP_HEIGHT}
      onClick={toggleSelect}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      boxSizing="border-box"
      border={4}
      borderColor={
        clip.selected ? "lightgreen" : isHovered ? "gainsboro" : "transparent"
      }
      borderRadius={2}
      sx={{
        background: `url(${thumbnailUrl(clip)})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
      }}
    ></Box>
  );
}

export default TimelineClip
