import axios from "axios";

export const logIn = async (username: string, password: string) => {
  return await axios.post(`/api/user/login`, {
    username: username,
    password: password,
  });
};

export const logOut = async () => {
  return await axios
    .post(`/api/user/logout`)
    .then(() => console.log("successfully logged out"))
    .catch((e: any) => console.log("error while logging out: ", e));
};

export const logInCustomer = async (id: string, access_code: string) => {
  return await axios.post(`/api/user/customer-login`, {
    id: id,
    access_code: access_code,
  });
};

export const register = async (username: string, password: string) => {
  return await axios.post(`/api/user/register`, {
    username: username,
    password: password,
  });
};

export const getScenes = async (activeProject: string) => {
  return await axios.get(`/api/project/${activeProject}/scenes`);
};

export const fetchToken = () => axios.get("/api/token/");

export const refreshToken = () => axios.post("/api/token/refresh");

export const getAssets = async (activeProject: string) => {
  return await axios.get(`/api/project/${activeProject}/assets`);
};

export const initHLS = async (assetId: string) => {
  return await axios.put(`/api/asset/${assetId}/stream`);
};

export const exportVideoEdits = async (activeProject: string, data: any) => {
  return await axios.post(`/api/video-editor/${activeProject}/edit`, data);
};
