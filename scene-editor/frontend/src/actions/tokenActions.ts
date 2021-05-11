import { SET_TOKEN, SET_LOADING } from '../types/actions';
import { logIn as loginAPI, logOut as logOutAPI, fetchToken } from '../util/api';

export const setToken = (token: any) => ({
  type: SET_TOKEN,
  payload: token
})

export const setLoading = (loading:any) => ({
  type: SET_LOADING,
  payload: loading
})

export const logIn = (username:string, password:string) => (dispatch:any) => {
  loginAPI(username, password).then((res) => {
      const token = res.data;
      dispatch(setToken({id: token.id, role: token.role}))
    })
    .catch((e) => {
      console.log(e);
      console.error("Error in login");
  });
}

export const logOut = () => (dispatch:any) => {
  logOutAPI().then((res) => {
    dispatch(setToken({id: "", role: ""}))
  })
  .catch((e) => {
    console.log(e);
    console.log('Error in logout')
  })
}

export const retrieveToken = () => (dispatch:any) => {
  dispatch(setLoading(true));
  fetchToken()
    .then((res:any) => dispatch(setToken(res.data)))
    .then(() => dispatch(setLoading(false)))
    .catch((e:any) => {
      console.log('error while fetching token', e)
      dispatch(setLoading(false))
    })
}
