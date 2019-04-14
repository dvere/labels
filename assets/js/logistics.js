var url = '/consignments/',
  fields = [
    'tracking_number',
    'requested_route',
    'consolidation_id',
    'delivery_address_type',
    'package_type',
    'status',
    'package_type'
  ],
  data = {
    q: 'collected:SW',
    count: 1000,
    client_id: 11270,
    fields: fields.join()
  };

function showEvents(t){
  var u = '/consignments/' + t + '/events',
      cEvents = $('<div>', {
        'id': 'audit-container'
      })
      .css({
        margin: 20,
        width: 500
      }),
      cHeader = $('<div>',{class: 'event'})
        .css({
          display: 'grid',
          gridTemplateColumns: '140px 40px 180px 140px',
          color: 'rgba(255,255,255,1)',
          backgroundColor: 'rgba(55,55,55,1)'
        });

  $.each(['Timestamp', 'SC','Event','User'], function(){
    $('<div>',{text: $(this)}).appendTo(cHeader);
  });
  
  $('#cTarget').empty();
  $.getJSON(u,function(json){
    $.each(json, function(i, obj) {
      var cEvent = $('<div>',{class: 'event'})
        .css({
          display: 'grid',
          gridTemplateColumns: '140px 40px 180px 140px',
          border: '1px none solid solid solid rgba(0,0,0,.7)'
        });
      obj.service_centre = obj.service_centre || {code: 'NA'};
      obj.user = obj.user || {username: 'NA'};
      $('<div>', {'class': 'audit', 'text': obj.timestamp}).appendTo(cEvent);
      $('<div>', {'class': 'audit', 'text': obj.service_centre.code}).appendTo(cEvent);
      $('<div>', {'class': 'audit', 'text': obj.tracking_code.code}).appendTo(cEvent);
      $('<div>', {'class': 'audit', 'text': obj.user.username}).appendTo(cEvent);
      cEvent.appendTo(cEvents);
    });
    $('#cTarget').append(cEvents);
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

      $('<td>', {'class': 'results-data', 'text': obj.package_type}).appendTo(tr);
      $('<td>', {'class': 'results-data', 'text': obj.requested_route}).appendTo(tr);
      $('<td>', {'class': 'results-data', 'text': obj.consolidation_id}).appendTo(tr);
      $('<td>', {'class': 'results-data', 'text': obj.status}).appendTo(tr);
      $('#cons').append(tr);
    }
  });
  $('.results-data').css({padding: '0 6px', border: '1px solid rgba(0,0,0)'});
}

function addPartsToDOM(){
  $('div.ed').remove();
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
