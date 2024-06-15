import { combineReducers } from 'redux';

import token from './tokenReducer';
import scene from './sceneReducer';
import stories from './timelineReducer';
import sidebarOpen from './sidebarReducer';

const rootReducer = combineReducers({
  token,
  scene,
  stories,
  sidebarOpen,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
