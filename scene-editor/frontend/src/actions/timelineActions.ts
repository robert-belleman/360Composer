import { TIMELINE_ADD, TIMELINE_DELETE, TIMELINE_ADD_SCENE } from '../types/actions';

export const addTimeline = (name:string, description:string) => ({
  type: TIMELINE_ADD,
  payload: {name, description}
});

export const deleteTimeline = (timelineID: number) => ({
  type: TIMELINE_DELETE,
  payload:{timelineID}
});

export const addSceneToTimeline = (timelineID: number, sceneID: number) => ({
  type: TIMELINE_ADD_SCENE,
  payload: {timelineID, sceneID}
});