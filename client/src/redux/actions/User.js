import {Constants} from '../../common/Constants';

export const userActions = {
    userSelected    
};

function userSelected(userId) {
  return dispatch => {
    dispatch(request({ userId }));
  };
  function request(user) {
    return {
      type: Constants.USER_SELECTED,
      user
    }
  }
}