import {Constants} from '../../common/Constants';
import AuthService from "../../services/AuthService";
import { message } from 'antd';

const login = (username, password) => (dispatch) => {
  return AuthService.login(username, password).then((data) => {
    dispatch({
      type: Constants.LOGIN_SUCCESS,
      payload: { user: data },
    });
    return Promise.resolve();
  }).catch(error => {
  	console.log(error);
    return Promise.reject();
  })
};

const logout = () => (dispatch) => {
  AuthService.logout();

  dispatch({
    type: Constants.LOGOUT,
  });
};

export const authActions = {
  login,
  logout    
};
