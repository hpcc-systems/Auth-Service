import {Constants} from '../../common/Constants';

export const roleActions = {
    roleSelected    
};

function roleSelected(roleId, applicationType) {
  return dispatch => {
    dispatch(request({ roleId, applicationType }));
  };
  function request(role) {
    return {
      type: Constants.ROLE_SELECTED,
      role
    }
  }
}