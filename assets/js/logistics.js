var url = '/consignments/',
  fields = [
    'tracking_number',
    'requested_route',
    'consolidation_id',
    'delivery_address_type',
    'package_type',
    'status',
//    'audit.description',
//    'audit.service_centre_code',
    'package_type'
  ],
  data = {
    q: 'collected:SW',
    count: 1000,
    client_id: 11270,
    fields: fields.join()
  };

function showEvents(t){
  var u = '/consignments/' + t + '/events';
  var cd = $('<div>', {
      'id': 'audit-container'
    })
    .css({
      margin: 20,
      width: 400
    });
  
  $.getJSON(u,function(json){
    $.each(json, function(i, obj) {
      var ar = $('<div>',{class: 'event'})
        .css({
          display: 'grid',
          gridTemplateColumns: '150px 50px 100px 100px'
        });
      obj.service_centre = obj.service_centre || {code: 'NA'};
      obj.user = obj.user || {username: 'NA'};
      $('<div>', {'class': 'audit', 'text': obj.timestamp}).appendTo(ar);
      $('<div>', {'class': 'audit', 'text': obj.service_centre.code}).appendTo(ar);
      $('<div>', {'class': 'audit', 'text': obj.tracking_code.code}).appendTo(ar);
      $('<div>', {'class': 'audit', 'text': obj.user.username}).appendTo(ar);
      ar.appendTo(cd);
    });
    $('#cTarget').append(cd);
  //  $('.audit').css({flex: '1 25%'});
    $('#cTarget').show();
  }).fail(function(){
    console.log('Events Request Failed');
  });
}

function getCollectedCons() {
  var consList;
  $('#cons').empty();
  
  data.received_at = $('.cDate').val();
  
  $.getJSON(url, data, function(json){
    formatCons(json);
  }).fail(function(){
    console.log('Request Failed');
  });  
}

function formatCons(json){
  $.each(json, function(i, obj) {
    if(obj.status != 'DELIVERED') {
      var tr = $('<tr/>');

      $('<td>', {
        'class': 'results-data',
        'text': obj.tracking_number,
        'onclick': 'showEvents(' + obj.id + ')',
        'id': obj.id
      }).appendTo(tr);

      $('<td>', {
        'class': 'results-data',
        'text': obj.package_type
      }).appendTo(tr);

      $('<td>', {
        'class': 'results-data',
        'text': obj.requested_route
      }).appendTo(tr);

      $('<td>', {
        'class': 'results-data',
        'text': obj.consolidation_id
      }).appendTo(tr);

      $('<td>', {
        'class': 'results-data',
        'text': obj.status
      }).appendTo(tr);
/*
      $('<td>',{
        'class': 'results-data',
        'text': obj.consignment_events[0].service_centre_code,
        'title': obj.consignment_events[0].description
      }).appendTo(tr);

      $('<td>',{
        'class': 'results-data',
        'text': obj.consignment_events[0].description
      }).appendTo(tr);
*/
      $('#cons').append(tr);
    }
  });
  $('.results-data').css({padding: '0 6px', border: '1px solid rgba(0,0,0)'});
}

function addPartsToDOM(){
  var ed = $('<div>',{'class':'ed'})
    .append($('<input>', {'class':'cDate', 'type':'date'}))
    .append($('<button>', {'id': 'goButton', 'text': 'Lookup Collections', 'onclick': 'getCollectedCons()'}))
    .append($('<div>', {'id':'cTarget', 'style':'display:none'}))
    .append($('<table>', {'id': 'cons'}).css({marginLeft: 20}));
  $('#breadcrumbs').after(ed);
	$('.cDate').css({lineHeight: '1.2em', marginLeft: 20});
	$('#goButton').css({lineHeight: '1.3em',marginLeft: 4});
	$('#cTarget').click(function(){
    $(this).slideUp();
  });
};

$.when($.ready).then(function() {
	addPartsToDOM();
});
