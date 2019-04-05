function getJSON(cDate) {
	var url = '/consignments/',
			data = {
				q: 'collected:SW',
	  		count: 5000,
				client_id: 11270,
				received_at: cDate
			};
	var jqxhr = $.get(url, data, function(json) {
		return json;		
	})
		.fail(function(){
			alert('Request failed');
		});
};

function embedDiv(){
	$('<div>').addClass('ed').insertBefore('#nav-search')
	  .append($('<input>').addClass('cDate').attr('type', 'date'));
		// onchange?
};

function popUpModal() {
};

$.when($.ready).then(function() {
	var div = 
};
