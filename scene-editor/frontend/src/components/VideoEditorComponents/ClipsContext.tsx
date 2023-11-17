/**
 * ClipsContext.tsx
 *
 * Description:
 * This file defines a React Context and a corresponding reducer for managing
 * clips in a timeline. The context, ClipsContext, encapsulates the state of
 * clips and provides a dispatch function for handling different actions,
 * such as appending, removing, inserting, splitting, deleting, duplicating,
 * and exporting clips. The state includes information about each clip, such
 * as its asset details, start time, duration.
 *
 * Contents:
 * - Asset: Interface defining the structure of video assets.
 * - Clip: Interface defining the structure of clips.
 * - ClipsState: Interface defining the state structure, including an array of clips.
 * - Action: Type defining the possible actions that can be dispatched to modify the state.
 * - ContextType: Interface defining the shape of the context values.
 * - ClipsContext: React Context for the application state and dispatch function.
 * - initialState: The initial state of the application, containing an empty array of clips.
 * - thumbnailUrl: Function to find the thumbnail URL of a clip.
 * - seekIndex: Function to seek the index of a clip that intersects with a given time.
 * - reducer: Reducer function responsible for handling state modifications based on dispatched actions.
 * - ClipsProvider: Context provider component to wrap the application and make the state and dispatch accessible.
 * - useClipsContext: Custom hook for conveniently accessing the context values.
 *
 */

import React, { ReactNode, createContext, useContext, useReducer } from "react";

import axios from "axios";

import defaultImage from "../../static/images/default.jpg";
import { CLIP_UNDO_STATES, MINIMUM_CLIP_LENGTH } from "./Constants";
import { DLLNode, DoublyLinkedList } from "./DoublyLinkedList";
import { Asset } from "./MediaLibraryComponents/AssetsContext";

export interface Clip {
  asset: Asset; // Reference to an asset.
  startTime: number; // Start time within the asset.
  duration: number; // Duration of the clip in seconds.
  selected: boolean; // Indicate if clip is selected.
}

interface State {
  clips: DoublyLinkedList<Clip>;
  past: State[];
  future: State[];
  totalDuration: number;
}

/* The state of Clips can be altered using these action types. */
export const SELECT_CLIP = "SELECT_CLIP";
export const APPEND_CLIP = "APPEND_CLIP";
export const SPLIT_CLIP = "SPLIT_CLIP";
export const DELETE_CLIPS = "DELETE_CLIPS";
export const DUPLICATE_CLIPS = "DUPLICATE_CLIPS";
export const UNDO = "UNDO";
export const REDO = "REDO";

type Action =
  | { type: typeof SELECT_CLIP; payload: { clip: Clip } }
  | { type: typeof APPEND_CLIP; payload: { clip: Clip } }
  | { type: typeof SPLIT_CLIP; payload: { time: number } }
  | { type: typeof DELETE_CLIPS }
  | { type: typeof DUPLICATE_CLIPS }
  | { type: typeof UNDO }
  | { type: typeof REDO };

interface ClipsContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ClipsContext = createContext<ClipsContextProps | undefined>(undefined);

const initialState: State = {
  clips: new DoublyLinkedList<Clip>(),
  past: [],
  future: [],
  totalDuration: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SELECT_CLIP: {
      const { clip } = action.payload;
      clip.selected = !clip.selected;
      return state;
    }
    case APPEND_CLIP: {
      const { clip } = action.payload;
      let newClips = state.clips.copy();
      newClips.append(clip);
      const newPast = [...state.past, state].slice(-CLIP_UNDO_STATES);
      const newFuture = [] as State[];
      const newDuration = state.totalDuration + clip.duration;
      return {
        ...state,
        clips: newClips,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case SPLIT_CLIP: {
      const { time } = action.payload;
      let newClips = state.clips.copy();
      if (!newClips.split(time, duration, splitClip)) {
        return state;
      }
      const newPast = [...state.past, state].slice(-CLIP_UNDO_STATES);
      const newFuture = [] as State[];
      return { ...state, clips: newClips, past: newPast, future: newFuture };
    }

    case DELETE_CLIPS: {
      let newClips = state.clips.copy();
      const durationLost = newClips.deleteNodes(selected, duration);
      const newPast = [...state.past, state].slice(-CLIP_UNDO_STATES);
      const newFuture = [] as State[];
      const newDuration = state.totalDuration - durationLost;
      return {
        ...state,
        clips: newClips,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case DUPLICATE_CLIPS: {
      let newClips = state.clips.copy();
      const durationAdded = newClips.appendNodes(selected, duration, deselect);
      const newPast = [...state.past, state].slice(-CLIP_UNDO_STATES);
      const newFuture = [] as State[];
      const newDuration = state.totalDuration + durationAdded;
      return {
        ...state,
        clips: newClips,
        past: newPast,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case UNDO: {
      if (!canUndo(state)) {
        return state;
      }

      const newPast = state.past.slice(0, state.past.length - 1);
      const newState = { ...state.past[state.past.length - 1] };
      const newFuture = [state, ...state.future];
      return { ...newState, past: newPast, future: newFuture };
    }

    case REDO: {
      if (!canRedo(state)) {
        return state;
      }

      const newPast = [...state.past, state];
      const newState = state.future[0];
      const newFuture = state.future.slice(1);
      return { ...newState, past: newPast, future: newFuture };
    }

    default:
      return state;
  }
};

const ClipsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue: ClipsContextProps = {
    state,
    dispatch,
  };

  return (
    <ClipsContext.Provider value={contextValue}>
      {children}
    </ClipsContext.Provider>
  );
};

const useClipsContext = (): ClipsContextProps => {
  const context = useContext(ClipsContext);
  if (!context) {
    throw new Error("useClipsContext must be used within a ClipsProvider");
  }
  return context;
};

const durationToString = (state: State, sep: string = " ") => {
  return state.clips.toString((clip: Clip) => clip.duration.toFixed(2), sep);
};

/**
 * Given a time, find the clip that intersects with it.
 * @param state Clips to iterate over.
 * @param time Time to find clip at.
 * @returns Object with attributes `node` and `offset`.
 */
const seekClip = (state: State, time: number) => {
  return state.clips.findNodeByAccumulatedSum(time, duration);
};

/**
 * Find the thumbnail URL of a Clip `clip`.
 * @param clip Clip to find the thumbnail URL of.
 * @returns thumbnail URL or defaultImage when not found.
 */
const thumbnailUrl = (clip: Clip) => {
  return clip.asset.thumbnail_path
    ? `/api/asset/${clip.asset.id}/thumbnail`
    : defaultImage;
};

/**
 * Indicate if the clip of a node is selected.
 * @param node node to check.
 * @returns boolean.
 */
const selected = (node: DLLNode<Clip>) => {
  return node.data.selected;
};

/**
 * Deselect a node.
 * @param node node to deselect.
 */
const deselect = (node: DLLNode<Clip>) => {
  node.data.selected = false;
};

/**
 * Indicate what the numerical value of a Clip `clip` is.
 * @param clip Clip to know the numerical value of.
 * @returns The duration of the clip.
 */
const duration = (clip: Clip) => {
  return clip.duration;
};

/**
 * Split a Clip `clip` at `time` seconds.
 * @param clipA Clip to split.
 * @param time Time to split.
 * @returns Return a dictionary with the first part and second part.
 */
const splitClip = (clipA: Clip, time: number) => {
  /* If the time is not within the bounds of clipA, then do not split. */
  const timeInBounds = 0 < time && time < clipA.duration;
  if (!timeInBounds) {
    return { firstPart: clipA, secondPart: null };
  }

  /* If the clips are too short, then do not split. */
  const firstPartInvalid = time < MINIMUM_CLIP_LENGTH;
  const secondPartInvalid = clipA.duration - time < MINIMUM_CLIP_LENGTH;
  if (firstPartInvalid || secondPartInvalid) {
    return { firstPart: clipA, secondPart: null };
  }

  let clipB: Clip = { ...clipA };

  clipA.duration = time;
  clipB.startTime += time;
  clipB.duration -= time;
  clipB.selected = true;

  return { firstPart: clipA, secondPart: clipB };
};

const visibleClips = (state: State, lower: number, upper: number) => {
  const visibleLength = (clip: Clip, startTime: number) => {
    let length = 0;

    /* If the clip is not in range [lower, upper], return 0. */
    const endTime = startTime + clip.duration;
    if (endTime < lower || startTime > upper) {
      return length;
    }

    /* Otherwise, compute the visible length. */
    const start = Math.max(startTime, lower);
    const end = Math.min(endTime, upper);
    length = end - start;
    return length;
  };

  let elapsedTime = 0;
  let current = state.clips.head;
  const results: any[] = [];
  while (current) {
    let length = visibleLength(current.data, elapsedTime);
    results.push({ node: current, length: length });
    elapsedTime += duration(current.data);
    current = current.next;
  }

  return results;
};

/**
 * Parse the important information of a clip to export it.
 * @param clip clip to parse.
 * @returns parsed information.
 */
const parseToExport = (clip: Clip) => {
  const endTime = clip.startTime + clip.duration;
  return {
    asset_id: clip.asset.id,
    start_time: clip.startTime,
    end_time: endTime,
    view_type: clip.asset.view_type,
  };
};

/**
 * Export the clips `clips` with title `title`.
 * @param clips clips to export.
 * @param title title to export with.
 */
const exportClips = async (projectID: string, clips: DoublyLinkedList<Clip>, title: string) => {
  const data = clips.toArray(parseToExport);
  const apiEndPoint = `/api/video-editor/${projectID}/edit`;

  try {
    const response = await axios.post(apiEndPoint, {
      clips: data,
      filename: title,
    });
    console.log("API Response: ", response.data);
  } catch (error) {
    console.error("API Error:", error);
  }
};

/**
 * Check if the state can be undone.
 * Used for disabling buttons in certain situations.
 * @param state
 * @returns boolean
 */
const canUndo = (state: State): boolean => {
  return !!(state.past && state.past.length > 0);
};

/**
 * Check if the state can be redone.
 * Used for disabling buttons in certain situations.
 * @param state
 * @returns boolean
 */
const canRedo = (state: State): boolean => {
  return !!(state.future && state.future.length > 0);
};

/**
 * Check if the clip can be split.
 * Used for disabling buttons in certain situations.
 * @param state
 * @returns boolean
 */
const canSplit = (state: State) => {
  return MINIMUM_CLIP_LENGTH < state.totalDuration;
};

export {
  ClipsProvider,
  canRedo,
  canSplit,
  canUndo,
  durationToString,
  exportClips,
  seekClip,
  thumbnailUrl,
  useClipsContext,
  visibleClips
};
