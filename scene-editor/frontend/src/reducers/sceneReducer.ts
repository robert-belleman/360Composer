import { SET_SCENES } from "../types/actions"

export default (state: any = { scenes: [], successful: true }, action: any) => {
  return action.type === SET_SCENES
    ? { ...action.payload }
    : state;
}