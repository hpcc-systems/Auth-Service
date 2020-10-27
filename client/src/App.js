import React, { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button } from 'antd';
import { createBrowserHistory } from 'history'
import { BrowserRouter as Router, Link, Route, Switch, useLocation, NavLink, Redirect  } from 'react-router-dom';
import {
  DesktopOutlined,
  TrademarkCircleFilled,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';
import './App.css';
import {PrivateRoute} from "./components/common/PrivateRoute";
import RolesList from "./components/roles/RolesList";
import RoleDetails from "./components/roles/RoleDetails";
import UserDetails from "./components/users/UserDetails";
import ApplicationsList from "./components/applications/ApplicationsList";
import UsersList from "./components/users/UsersList";
import Login from "./components/login/Login";
import { useSelector, useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import  {authActions}  from './redux/actions/Auth';
const { Header, Content, Footer, Sider } = Layout;

function App({props}) {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const { user: currentUser, isLoggedIn: isLoggedIn } = useSelector((state) => state.authReducer);
  let decoded = currentUser ? jwt_decode(currentUser.accessToken) : null;
  let fullName = decoded ? decoded.firstName + " " + decoded.lastName : "";    

  useEffect(() => {    
    console.log("xxx");
    if(isLoggedIn) {
      dispatch(authActions.verifyToken())    
    }
  }, [])

  const onCollapse = (collapsed) => {
    setCollapsed(collapsed)
  };

  const handleUserActionMenuClick = () => {
    localStorage.removeItem("user");
    window.location = '/login';
  }

  const userActionMenu = (
    <Menu onClick={handleUserActionMenuClick}>
      <Menu.Item key="1">Logout</Menu.Item>
    </Menu>
  );

  const getSelectedNav = () => {
    if(window.location.pathname) {
      let nav='1';
      switch(window.location.pathname) {
        case '/':
        case '/applications':
          nav = '1'
          break;
        case '/roles':
          nav = '2'
          break;
        case '/users':
          nav = '3'
          break;
      }    
      return [nav];
    }
  }

  return (
    <Router history={createBrowserHistory()}>
      <Route exact path="/login" component={Login} />
      {currentUser && currentUser.accessToken ?  
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
              <div className="logo">Auth Service</div>
              <Menu theme="dark" defaultSelectedKeys={getSelectedNav()} mode="inline">
                <Menu.Item key="1" icon={<DesktopOutlined />}>
                  <NavLink exact to={'/applications'}>Applications</NavLink>
                </Menu.Item>
                <Menu.Item key="2" icon={<TrademarkCircleFilled />}>
                  <NavLink exact to={'/roles'}>Roles</NavLink>
                </Menu.Item>
                <Menu.Item key="3" icon={<UserOutlined />}>
                  <NavLink exact to={'/users'}>Users</NavLink>
                </Menu.Item>
              </Menu>
            </Sider>
            <Layout className="site-layout">
              <Header className="site-layout-background" style={{ padding: 10 }} >                
                  <ul>
                    <li style={{"float":"right", "paddingRight":"10px"}}>                    
                      <Dropdown overlay={userActionMenu}>
                        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                          {fullName} <DownOutlined />
                        </a>
                      </Dropdown>              
                    </li>
                  </ul>    
                
              </Header>
              <Content style={{ margin: '0 16px' }}>              
                <Switch>                  
                  <PrivateRoute exact path="/" component={ApplicationsList}/>
                  <PrivateRoute path="/applications" component={ApplicationsList}/>
                  <PrivateRoute path="/roles" component={RolesList}/>
                  <PrivateRoute path="/users" component={UsersList}/>
                  <PrivateRoute path="/role/details" component={RoleDetails}/>
                  <PrivateRoute path="/user/details" component={UserDetails}/>
                </Switch>  
              </Content>
              <Footer style={{ textAlign: 'center' }}></Footer>
            </Layout>
          </Layout>
        : <Redirect from="*" to="/login" />}  
    </Router>    
  );
}

export default App;
