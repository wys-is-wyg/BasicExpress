$(document).ready(function(){

	setNotices = function(notice){
		$('#notices').html(`<p>${notice}</p>`);
	}
	
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();

	$('.custom-file-input').change(function(e){
		var fileName = e.target.files[0].name;
		$(this).next('.custom-file-label').html(fileName);
	});

});