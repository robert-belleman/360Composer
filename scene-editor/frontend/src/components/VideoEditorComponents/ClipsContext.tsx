/**
 * ClipsContext.tsx
 *
 * Description:
 * This file defines a React context and a corresponding reducer for managing
 * video clips in a timeline. The context, ClipContext, encapsulates the state
 * of video clips and provides a dispatch function for handling different
 * actions, such as appending, removing, inserting, splitting, deleting,
 * duplicating, and exporting clips. The state includes information about
 * each clip, such as its asset details, start time, duration.
 *
 * Contents:
 * - Asset: Interface defining the structure of video assets.
 * - Clip: Interface defining the structure of video clips.
 * - State: Interface defining the state structure, including an array of clips.
 * - Action: Type defining the possible actions that can be dispatched to modify the state.
 * - ContextType: Interface defining the shape of the context values.
 * - ClipContext: React context for the application state and dispatch function.
 * - initialState: The initial state of the application, containing an empty array of clips.
 * - thumbnailUrl: Function to find the thumbnail URL of a clip.
 * - seekIndex: Function to seek the index of a clip that intersects with a given time.
 * - reducer: Reducer function responsible for handling state modifications based on dispatched actions.
 * - ClipsProvider: Context provider component to wrap the application and make the state and dispatch accessible.
 * - useClips: Custom hook for conveniently accessing the context values.
 *
 */

import React, { ReactNode, createContext, useContext, useReducer } from "react";

import defaultImage from "../../static/images/default.jpg";
import { Asset } from "./AssetsContext";
import { MINIMUM_CLIP_LENGTH } from "./Constants";

export interface Clip {
  asset: Asset; // Reference to an asset.
  startTime: number; // Start time within the asset.
  duration: number; // Duration of the clip in seconds.
  selected: boolean; // Indicate if the clip is selected.
}

interface State {
  clips: Clip[];
}

export const APPEND_CLIP = "APPEND_CLIP";
export const REMOVE_CLIP = "REMOVE_CLIP";
export const INSERT_CLIP = "INSERT_CLIP";
export const SPLIT_CLIP = "SPLIT_CLIP";
export const DELETE_CLIPS = "DELETE_CLIPS";
export const DUPLICATE_CLIPS = "DUPLICATE_CLIPS";
export const EXPORT_CLIPS = "EXPORT_CLIPS";

type Action =
  | { type: typeof APPEND_CLIP; payload: { clip: Clip } }
  | { type: typeof REMOVE_CLIP; payload: { index: number } }
  | { type: typeof INSERT_CLIP; payload: { index: number; clip: Clip } }
  | { type: typeof SPLIT_CLIP; payload: { time: number } }
  | { type: typeof DELETE_CLIPS; payload?: { indices: number[] } }
  | { type: typeof DUPLICATE_CLIPS; payload?: { indices: number[] } }
  | { type: typeof EXPORT_CLIPS; payload: { title: string } };

interface ContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  thumbnailUrl: (clip: Clip) => string;
}

const ClipContext = createContext<ContextType | undefined>(undefined);

const initialState: State = { clips: [] };

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
 * Seek the index of a Clip that intersects with time `time` in State `state`.
 * @param state state of the clips.
 * @param time time of intersection.
 * @returns [index, elapsedTime] or [null, null] when no intersection found.
 */
const seekIndex = (state: State, time: number) => {
  let elapsedTime = 0;
  for (let i = 0; i < state.clips.length; i++) {
    if (time < elapsedTime + state.clips[i].duration) {
      return [i, elapsedTime];
    }

    elapsedTime += state.clips[i].duration;
  }
  return [null, null];
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case APPEND_CLIP: {
      return { ...state, clips: [...state.clips, action.payload.clip] };
    }
    case REMOVE_CLIP: {
      const { index } = action.payload;
      return {
        ...state,
        clips: [...state.clips.filter((_, i) => i !== index)],
      };
    }
    case INSERT_CLIP: {
      const { index, clip } = action.payload;
      const clipsBefore = state.clips.slice(0, index);
      const clipsAfter = state.clips.slice(index);
      return { ...state, clips: [...clipsBefore, clip, ...clipsAfter] };
    }
    case SPLIT_CLIP: {
      const { time } = action.payload;

      /* Find the index of the clip that intersects with time `time`. */
      const [index, elapsedTime] = seekIndex(state, time);
      if (index === null) {
        return { ...state };
      }

      /* Get the clips before and after the clip at index `index`.  */
      const clipsBefore = state.clips.slice(0, index);
      const clipsAfter = state.clips.slice(index + 1);

      /* Initialize variables to split the clip at index `index` into.  */
      let clipA = state.clips[index];
      let clipB = { ...state.clips[index] };

      /* If the clip is too short, then do not update state. */
      const secondsIntoClip = time - elapsedTime!;
      if (secondsIntoClip < MINIMUM_CLIP_LENGTH) {
        return state;
      }

      /* Split the clip at index `index` at time `secondsIntoClip`. */
      clipA.duration = secondsIntoClip;
      clipB.startTime = secondsIntoClip;
      clipB.duration = clipB.duration - secondsIntoClip;

      /* Insert the `clipA` and `clipB` and update the start times. */
      return { ...state, clips: [...clipsBefore, clipA, clipB, ...clipsAfter] };
    }
    case DELETE_CLIPS: {
      const { indices } = action.payload || {};
      return {
        ...state,
        clips: indices
          ? state.clips.filter((_, index) => !indices.includes(index))
          : state.clips.filter((clip) => !clip.selected),
      };
    }
    case DUPLICATE_CLIPS: {
      const { indices } = action.payload || {};
      const clipsToUpdate = indices
        ? state.clips.filter((_, index) => indices.includes(index))
        : state.clips.filter((clip) => clip.selected);
      return {
        ...state,
        clips: state.clips
          .map((clip) => ({ ...clip, selected: false }))
          .concat(clipsToUpdate),
      };
    }
    case EXPORT_CLIPS: {
      return { ...state }; // TODO: make api call
    }
    default:
      return state;
  }
};

const ClipsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ClipContext.Provider value={{ state, dispatch, thumbnailUrl }}>
      {children}
    </ClipContext.Provider>
  );
};

const useClips = (): ContextType => {
  const context = useContext(ClipContext);
  if (!context) {
    throw new Error("useClips must be used within a ClipsProvider");
  }
  return context;
};

export { ClipsProvider, useClips };
