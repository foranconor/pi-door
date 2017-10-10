$(document).ready(function() {
	var p = '';
	try {
		$('#password').val(localStorage.k);
		p = $('#password').val();
	} catch (error) { 
		console.error('failed to load password');
	}
	$('#door').click(function() {
		$.get('nonce', function(data) {
			var hash = CryptoJS.SHA3(p + data.nonce);
			$.post('door', { key: hash.toString() });
		});
	}); 
	$('#password').keyup(function() {
		p = $('#password').val();
		localStorage.k = p;
	});
});


