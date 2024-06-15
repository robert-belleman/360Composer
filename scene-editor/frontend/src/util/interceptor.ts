import { api, refreshToken } from './api';
import { logOut } from '../actions/authActions';

const MUST_BE_USER = "Must be user";
const NOT_EXISTS = "User or customer does not exist";
const NO_ACCESS_PROJECT = "No access to project"
const UNAUTHORIZED_FOR_USER = "Unauthorized for user"

export const initInterceptor = (dispatch:any) => {
  var prevURL: string | null = null;

  api.interceptors.response.use(
    (response:any) => response,
    async (error:any) => {
      // console.log('error is', error);
      const reject_ = () => new Promise((resolve, reject) => {
        reject(error);
      });

      const retry_ = () => new Promise((resolve, reject) => {
        api.request(error.config)
          .then((resp:any) => resolve(resp))
          .catch((e: any) => reject(e));
      });

      // Ignore any non 401 errors
      if (!error.response || error.response.status !== 401) {
        return reject_();
      }

      if ([MUST_BE_USER, NOT_EXISTS, NO_ACCESS_PROJECT, UNAUTHORIZED_FOR_USER].includes(error.response.data.msg) || error.config.url === '/api/token/refresh') {
        dispatch(logOut());
        return reject_();
      }

      /* prevent interceptor from looping. */
      if (error.config.url === prevURL) {
        prevURL = null;
        return reject_();
      }

      prevURL = error.config.url;

      return refreshToken()
        .then(retry_)
        .catch(reject_)
    }
  )
}