import {Constants} from '../../common/Constants';
import AuthService from "../../services/AuthService";
import { message } from 'antd';
import jwt_decode from "jwt-decode";

const login = (username, password) => (dispatch) => {
  return AuthService.login(username, password).then((data) => {
    console.log(data);    
	  if(data.auth) {
    	let decoded = jwt_decode(data.accessToken);
    	let adminRole = decoded.role.filter(role => role.name == 'AuthService-Admin');
    	if(adminRole && adminRole.length > 0) {
		    dispatch({
		      type: Constants.LOGIN_SUCCESS,
		      payload: { user: data },
		    });    		
    	} else {
    		return Promise.reject("Insufficitent Privileges");
    	}
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
  console.log("verifyToken")
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
