import { TOGGLE_SIDEBAR } from "../types/actions"

const sidebarReducer = (state: any = false, action: any) => {
  return action.type === TOGGLE_SIDEBAR ? !state : state;
}

export default sidebarReducer;