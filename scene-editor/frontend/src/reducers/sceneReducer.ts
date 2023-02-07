import { SET_SCENES } from "../types/actions"

const sceneReducer = (state: any = { scenes: [], successful: true }, action: any) => {
  return action.type === SET_SCENES
    ? { ...action.payload }
    : state;
}

export default sceneReducer