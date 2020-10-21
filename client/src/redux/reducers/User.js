import {Constants} from '../../common/Constants';

const initialState = {};

export function userReducer(state = initialState, action) {
  switch (action.type) {
    case Constants.USER_SELECTED:
      return {
        user: action.user
      };
    default:
      return state
  }
}