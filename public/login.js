
function login() {
	let password = JSON.stringify({pwd: $('#password').val()})
	$.ajax({
		async: true,
		url: './auth',
		type: 'post',
		contentType: 'application/json',
		accepts: '*/*',
		data: password,
		success: (result,status,xhr) => {
			console.log(result);
			window.location.href = './?auth=' + encodeURI(result.jwt);
		},
		error: (xhr,status,error) => {
			console.log(error);
		}
	});
	return false;
}