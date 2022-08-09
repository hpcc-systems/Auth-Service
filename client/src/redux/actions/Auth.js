import {Constants} from '../../common/Constants';
import AuthService from "../../services/AuthService";

const login = (username, password) => (dispatch) => {
  return AuthService.login(username, password).then((data) => {
    console.log(data);    
	  if(data.auth) {
	    dispatch({
	      type: Constants.LOGIN_SUCCESS,
	      payload: { user: data },
	    });    		
    }
    return Promise.resolve();
  }).catch(error => {
  	console.log(error);
    return Promise.reject(error);
  })
};

const logout = () => (dispatch) => {
  AuthService.logout();

  dispatch({
    type: Constants.LOGOUT,
  });
};

const verifyToken = () => (dispatch) => {
  AuthService.verifyToken().then((data) => {
  }).catch(error => {
  	console.log(error);  	
  	AuthService.logout();
	  dispatch({
	    type: Constants.LOGOUT,
	  });
  })
};

export const authActions = {
  login,
  logout,
  verifyToken    
};
