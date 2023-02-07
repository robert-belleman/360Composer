import _ from 'lodash';
import { TIMELINE_ADD, TIMELINE_ADD_SCENE, TIMELINE_DELETE } from '../types/actions';

const DEFAULT_POS = { x: 250, y: 250}

type Timeline = {
  name: string,
  description: string,
  blocks: { [sceneID:number]: { position: { x: number, y: number }}}
}

type State = {
  nextID: number,
  timelines: {[id: number]: Timeline}
}

const addTimeline = (state: State, {name, description}:any): State => {
  const id = state.nextID;
  const timeline = {[id]: {name, description, blocks: {}}};

  return {nextID: state.nextID + 1, timelines: _.merge(timeline, state.timelines)};
}

const removeTimeline = (state: State, {timelineID}:any): State => {
  const filteredTimelines = Object.keys(state.timelines).map(parseInt).reduce((acc:any, id:number) => {
    return id === timelineID ? acc : _.merge(acc, state.timelines[id])
  }, {});

  return {nextID: state.nextID, timelines: filteredTimelines};
}

const addScene = (state: State, timelineID: number, sceneID: number): State => {
  const sceneView = { [sceneID]: { position: DEFAULT_POS }};
  const timeline: Timeline = state.timelines[timelineID];
  const updatedTimeline = {...timeline, blocks: _.merge(sceneView, timeline.blocks) }
  
  return {nextID: state.nextID, timelines: _.merge(updatedTimeline, state.timelines)};
}

const timelineReducer = (state: State = {nextID: 0, timelines: {}}, action: any): State => {
  switch(action.type) {
    case TIMELINE_ADD:
      return addTimeline(state, action.payload);
    case TIMELINE_DELETE:
      return removeTimeline(state, action.payload);
    case TIMELINE_ADD_SCENE:
      return addScene(state, action.payload.timelineID, action.payload.sceneID);
    default:
      return state;
  }
}

export default timelineReducer;