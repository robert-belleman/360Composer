import { TOGGLE_SIDEBAR } from "../types/actions"

export default (state: any = false, action: any) => {
  return action.type === TOGGLE_SIDEBAR ? !state : state;
}