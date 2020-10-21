import React from 'react';
import { Route, Redirect } from 'react-router';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('user')
            ? <Component {...props} {...rest}/>
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
)