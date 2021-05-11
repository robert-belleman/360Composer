import { SET_SCENES } from '../types/actions';
import { getScenes as getScenesAPI } from '../util/api';

export const setScenes = (scenes:any, successful:boolean) => ({
  type: SET_SCENES,
  payload: {scenes, successful}
})

export const fetchScenes = (activeProject:string) => (dispatch:any) => {
  getScenesAPI(activeProject)
    .then((res:any) => dispatch(setScenes(res.data, true)))
    .catch((e) => { console.log(e); dispatch(setScenes([], false)); });
}
