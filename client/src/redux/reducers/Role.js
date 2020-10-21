import {Constants} from '../../common/Constants';

const initialState = {};

export function roleReducer(state = initialState, action) {
  switch (action.type) {
    case Constants.ROLE_SELECTED:
      return {
        role: action.role
      };
    default:
      return state
  }
}