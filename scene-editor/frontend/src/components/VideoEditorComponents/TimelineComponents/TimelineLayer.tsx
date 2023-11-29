/**
 * SortableList.tsx
 *
 * Description:
 * This component renders a DnD Context that contains TimelineClips that can
 * be sorted.
 *
 */

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

import { ActionTypes, useClipsContext } from "../ClipsContext";
import { useVideoContext } from "../VideoContext";
import SortableItem from "./SortableItem/SortableItem";
import TimelineClip from "./SortableItem/TimelineClip";
import { TimelineItem, useTimelineContext } from "./TimelineContext";

const TimelineLayer = () => {
  const { state: clipsState, dispatch } = useClipsContext();
  const { items, setItems } = useTimelineContext();
  const { reloadVideo } = useVideoContext();
  const [movedClips, setMovedClips] = useState(false);

  /**
   * If the clips have been moved, the reload the video.
   */
  useEffect(() => {
    if (movedClips) {
      reloadVideo();
      setMovedClips(false);
    }
  }, [movedClips]);

  /**
   * If the clips update, change the items to render.
   * NOTE: multiply clip.duration by 100, if MINIMUM_CLIP_LENGTH < 1. This is
   *       to ensure that the flexGrow property is not between 0 and 1.
   */
  useEffect(() => {
    setItems(
      clipsState.clips.map((clip, index) => ({
        id: index + 1,
        length: clip.duration * 100,
        content: <TimelineClip clip={clip} />,
      }))
    );
  }, [clipsState.clips]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 20 },
    }),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToParentElement]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <div style={{ display: "flex" }}>
          {items.map((props: TimelineItem) => (
            <SortableItem key={props.id} {...props} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item: TimelineItem) => item.id === active.id
      );
      const newIndex = items.findIndex(
        (item: TimelineItem) => item.id === over.id
      );

      dispatch({
        type: ActionTypes.MOVE_CLIP,
        payload: { oldIndex, newIndex },
      });
      setMovedClips(true);

      setItems((prevItems: TimelineItem[]) =>
        arrayMove(prevItems, oldIndex, newIndex)
      );
    }
  }
};

export default TimelineLayer;
