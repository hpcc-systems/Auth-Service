import React, { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button } from 'antd';
import { createBrowserHistory } from 'history'
import { BrowserRouter as Router, Link, Route, Switch, useLocation, NavLink } from 'react-router-dom';
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
import { useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
const { Header, Content, Footer, Sider } = Layout;

function App({props}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({});
  const [selectedNav, setSelectedNav] = useState(['1']);
  const { user: currentUser } = useSelector((state) => state.authReducer);
  let decoded = currentUser ? jwt_decode(currentUser.accessToken) : null;
  let fullName = decoded ? decoded.firstName + " " + decoded.lastName : "";
  //const location = useLocation();
  
  /*useEffect(() => {    
    if(location) {
      let nav=[];
      console.log('pathname: '+location.pathname)
      switch(location.pathname) {
        case '/applications':
          nav.push('1')
          setSelectedNav(nav);
          break;
        case '/roles':
          nav.push('2')
          setSelectedNav(nav);
          break;
        case '/users':
          nav.push('3')
          setSelectedNav(nav);
          break;
      }    
      console.log('selectedNav: '+selectedNav)  
    }
  }, [location])*/

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

  return (
    <Router history={createBrowserHistory()}>
      <Route exact path="/login" component={Login} />
      {currentUser && currentUser.accessToken ?  
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
              <div className="logo">Auth Service</div>
              <Menu theme="dark" defaultSelectedKeys={selectedNav} mode="inline">
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
        : null}  
    </Router>    
  );
}

export default App;
