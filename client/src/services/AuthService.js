import { message } from 'antd';
import { authHeader} from "../components/common/AuthHeader.js"
const login = (username, password) => {
  return new Promise((resolve, reject) => {
    fetch('/api/auth/login', {
      method: 'post',
      //headers: authHeader(),
      headers: { 
        "Content-type": "application/json; charset=UTF-8"
      }, 
      body: JSON.stringify({'username':username, 'password': password})
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        reject("Login failed")
      }
    }).then(function(data) {
      if(data && data.auth) {
        localStorage.setItem("user", JSON.stringify(data));
        resolve(data);
      } else {
       reject("Login failed") 
      }
    });
  })
}  

const verifyToken = () => {
  console.log("verifToken")
  return new Promise((resolve, reject) => {
    fetch('/api/auth/verify', {
      method: 'post',
      headers: authHeader()      
    }).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        
        reject("Login failed")
      }
    }).then(function(data) {
      console.log(data);
      resolve(data);
    });
  })
}  

const logout = () => {
  localStorage.removeItem("user");
  window.location = '/login';
};

export default {
  login,
  logout,
  verifyToken
};