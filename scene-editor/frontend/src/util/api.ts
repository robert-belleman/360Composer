import axios from "axios";

export const logIn = async (username:string, password:string) => {
  return await axios.post(`/api/user/login`, {"username":username, "password": password} )
}

export const logOut = async () => {
  return await axios.post(`/api/user/logout`)
    .then(() => console.log('successfully logged out'))
    .catch((e:any) => console.log('error while logging out: ', e))
}

export const getScenes = async (activeProject:string) => {
  return await axios.get(`/api/project/${activeProject}/scenes`);
}

export const fetchToken = () => axios.get('/api/token/');

export const refreshToken = () => axios.post('/api/token/refresh')
