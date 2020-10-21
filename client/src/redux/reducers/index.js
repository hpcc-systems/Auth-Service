import { combineReducers } from 'redux';
import { roleReducer } from './Role';
import { userReducer } from './User';
import { authReducer } from './Auth';

const rootReducer = combineReducers({
    roleReducer,
    userReducer,
    authReducer
});

export default rootReducer;