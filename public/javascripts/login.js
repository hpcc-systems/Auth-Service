$(document).ready(() => {
	$('#login-btn').on('click', (e) => {
		e.preventDefault();
		$.post("/auth/login",
	    {
	      "username": $('#username').val(),
	      "password": $('#password').val()
	    })
	    .done(function (data) {
	    	if(data.auth && data.accessToken) {
	    		window.location = '/admin';
	    	}
	    })
	    .fail(function (response) {
	    	$('.alert').fadeIn()
	    })
	});

	$('#signout').on('click', (e) => {
		e.preventDefault();
		$.post("/users/signout")
	    .done(function (data) {
	    	window.location = '/login';
	    })
	    .fail(function (response) {
	    })
	});

	$('.alert').on('closed.bs.alert', function () {
		$('.alert').alert('dispose')
	})

});