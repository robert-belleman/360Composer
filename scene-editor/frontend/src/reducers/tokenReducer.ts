import { SET_TOKEN, SET_LOADING } from "../types/actions"

export default (state: any = { id: "", role: "",  loading: true }, action: any) => {
  switch (action.type) {
    case SET_TOKEN:
      return { id: action.payload.id, role: action.payload.role, loading: false};
    case SET_LOADING:
      return { ...state, loading: action.payload};
    default:
      return state;
  }
}