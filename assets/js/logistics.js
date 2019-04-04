function getIt() {
  var url = '/consignments/';
	var sDate = $('#qD').val();
	var data = {
	  q: 'collected:SW',
	  count: 5000,
		client_id: 11270,
		received_at: sDate,
	};
  $.ajax({
    url: url,
    data: data,
    success: success
  });
};

function embedDiv(){
 $('<div id="embededDiv"></div>').insertBefore('#nav-search');
};

function popUpModal() {
};

$.when($.ready).then(function() {
};
