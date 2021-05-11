import { combineReducers } from 'redux';

import token from './tokenReducer'
import scene from './sceneReducer';
import stories from './timelineReducer';
import sidebarOpen from './sidebarReducer';

export default combineReducers({token, scene, stories, sidebarOpen});