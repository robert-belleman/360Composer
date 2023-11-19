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
import { Asset } from "./MediaLibraryComponents/AssetsContext";

export interface Clip {
  asset: Asset; // Reference to an asset.
  startTime: number; // Start time within the asset.
  duration: number; // Duration of the clip in seconds.
  selected: boolean; // Indicate if clip is selected.
}

interface State {
  past: State[];
  clips: Clip[];
  future: State[];
  totalDuration: number;
}

/* The state of Clips can be altered using these action types. */
export const APPEND_CLIP = "APPEND_CLIP";
export const SPLIT_CLIP = "SPLIT_CLIP";
export const DELETE_CLIPS = "DELETE_CLIPS";
export const DUPLICATE_CLIPS = "DUPLICATE_CLIPS";
export const MOVE_CLIP = "MOVE_CLIP";
export const UNDO = "UNDO";
export const REDO = "REDO";

type Action =
  | { type: typeof APPEND_CLIP; payload: { clip: Clip } }
  | { type: typeof SPLIT_CLIP; payload: { time: number } }
  | { type: typeof DELETE_CLIPS }
  | { type: typeof DUPLICATE_CLIPS }
  | { type: typeof MOVE_CLIP; payload: { oldIndex: number; newIndex: number } }
  | { type: typeof UNDO }
  | { type: typeof REDO };

interface ClipsContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const ClipsContext = createContext<ClipsContextProps | undefined>(undefined);

const initialState: State = {
  clips: [],
  past: [],
  future: [],
  totalDuration: 0,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case APPEND_CLIP: {
      const { clip } = action.payload;
      const newPast = [...state.past, state].slice(-CLIP_UNDO_STATES);
      const newClips = [...state.clips, clip];
      const newFuture = [] as State[];
      const newDuration = state.totalDuration + clip.duration;
      return {
        ...state,
        past: newPast,
        clips: newClips,
        future: newFuture,
        totalDuration: newDuration,
      };
    }

    case SPLIT_CLIP: {
      const { time } = action.payload;

      const { index, timeInClip } = seekIndex(state, time);
      if (index === null) return state;

      const firstPart = timeInClip;
      const secondPart = state.clips[index].duration - timeInClip;
      if (firstPart < MINIMUM_CLIP_LENGTH || secondPart < MINIMUM_CLIP_LENGTH) {
        return state;
      }

      const [clipA, clipB] = splitClip(state.clips[index], timeInClip);

      return {
        ...state,
        clips: [
          ...state.clips.slice(0, index),
          clipA,
          clipB,
          ...state.clips.slice(index + 1),
        ],
        past: [...state.past, state].slice(-CLIP_UNDO_STATES),
        future: [],
      };
    }

    case DELETE_CLIPS: {
      const durationLost = state.clips.reduce(
        (acc, clip) => (clip.selected ? acc + clip.duration : acc),
        0
      );
      return {
        ...state,
        clips: state.clips.filter((clip) => !clip.selected),
        past: [...state.past, state].slice(-CLIP_UNDO_STATES),
        future: [],
        totalDuration: state.totalDuration - durationLost,
      };
    }

    case DUPLICATE_CLIPS: {
      const duplicatedClips = state.clips.reduce((acc: Clip[], clip) => {
        if (clip.selected) {
          acc.push({ ...clip });
          clip.selected = false;
        }
        return acc;
      }, []);

      const durationAdded = duplicatedClips.reduce(
        (acc, clip) => acc + clip.duration,
        0
      );

      return {
        ...state,
        clips: [...state.clips, ...duplicatedClips],
        past: [...state.past, state].slice(-CLIP_UNDO_STATES),
        future: [],
        totalDuration: state.totalDuration + durationAdded,
      };
    }

    case MOVE_CLIP: {
      const { oldIndex, newIndex } = action.payload;
      const clips = [...state.clips];
      const [movedClip] = clips.splice(oldIndex, 1);
      clips.splice(newIndex, 0, movedClip);

      return {
        ...state,
        clips,
        past: [...state.past, state].slice(-CLIP_UNDO_STATES),
        future: [],
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

/**
 * Create a clip from an asset.
 * @param asset asset to create clip with
 * @returns Clip object instance.
 */
const createClip = (asset: Asset): Clip => {
  const newClip: Clip = {
    asset: asset,
    startTime: 0,
    duration: asset.duration,
    selected: false,
  };
  return newClip;
};

/**
 * Seek the index of the clip that intersects with time `time`.
 * @param state state with an array of clips
 * @param time time to seek for clip
 * @returns index and time of intersection, null when no intersection found.
 */
const seekIndex = (
  state: State,
  time: number
): { index: number | null; timeInClip: number } => {
  let elapsedTime = 0;
  for (let i = 0; i < state.clips.length; i++) {
    if (time < elapsedTime + state.clips[i].duration) {
      return { index: i, timeInClip: time - elapsedTime };
    }
    elapsedTime += state.clips[i].duration;
  }
  return { index: null, timeInClip: 0 };
};

/**
 * Split a clip at `splitTime` and return `clipA` and `clipB`.
 * @param clip clip to split
 * @param splitTime time in clip to split at
 * @returns `clipA` and `clipB` as the first and second part respectively.
 */
const splitClip = (clip: Clip, splitTime: number) => {
  const clipA = { ...clip, duration: splitTime, selected: false };
  const clipB = {
    ...clip,
    startTime: splitTime,
    duration: clip.duration - splitTime,
    selected: true,
  };
  return [clipA, clipB];
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
  const results = [];
  for (let i = 0; i < state.clips.length; i++) {
    results.push(visibleLength(state.clips[i], elapsedTime));
    elapsedTime += state.clips[i].duration;
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
const exportClips = async (projectID: string, clips: Clip[], title: string) => {
  const data = clips;
  const apiEndPoint = `/api/video-editor/${projectID}/edit`;

  console.log({
    edits: data,
    filename: title,
  });

  try {
    const response = await axios.post(apiEndPoint, {
      edits: data,
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
  seekIndex,
  exportClips,
  thumbnailUrl,
  useClipsContext,
  visibleClips,
  createClip,
};
