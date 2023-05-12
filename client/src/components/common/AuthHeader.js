export function authHeader() {
    // return authorization header with jwt token
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        return {
            'Authorization': 'Bearer ' + user.accessToken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    } else {
        return {};
    }
}

export async function handleErrors(response) {
	let responseData = await response.json();
  if (!response.ok) {
    if(response.status === 422) {
    	let errMessage = responseData.errors.map(error => error.msg);
    	throw Error(errMessage);	
    } else {
    	throw Error(response.statusText);	
    }    
  }
  return responseData;
}