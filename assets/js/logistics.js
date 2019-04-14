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
        'id': 'cEvents'
      })
      .css({
        margin: '140px auto',
        width: 580,
        height: 400,
        padding: 40,
        backgroundColor: 'white',
        zIndex: '999',
        overflowY: 'scroll'
      }),
      cHeader = $('<div>',{class: 'events-header'})
        .css({
          display: 'grid',
          gridTemplateColumns: '140px 40px 180px 140px',
          color: 'rgba(255,255,255,1)',
          backgroundColor: 'rgba(55,55,55,1)'
        });

  $.each(['Timestamp', 'SC','Event','User'], function(i, t){
    $('<div>',{
      class: 'events-header-item',
      text: t
    })
      .css({padding: 4})
      .appendTo(cHeader);
  });
  
  $('#cAudits').empty();
  $('#cAudits').append(cEvents);
  $('#cEvents').append(cHeader);
  
  $.getJSON(u,function(json){
    $.each(json, function(i, obj) {
      var cEvent = $('<div>',{class: 'event'})
        .css({
          display: 'grid',
          gridTemplateColumns: '140px 40px 180px 140px'
        });
      obj.service_centre = obj.service_centre || {code: 'NA'};
      obj.user = obj.user || {username: 'NA'};
      $('<div>', {'class': 'event-item', 'text': obj.timestamp}).appendTo(cEvent);
      $('<div>', {'class': 'event-item', 'text': obj.service_centre.code}).appendTo(cEvent);
      $('<div>', {'class': 'event-item', 'text': obj.tracking_code.code}).appendTo(cEvent);
      $('<div>', {'class': 'event-item', 'text': obj.user.username}).appendTo(cEvent);
      cEvent.appendTo(cEvents);
    });
    $('.event').css({border: '1px solid rgba(0,0,0,.7)', borderTopStyle: 'none', backgroundColor: 'white'});
    $('.event-item').css({padding: 4});
    $('#cAudits').fadeIn();
  })
    .fail(function(){
      console.log('Events Request Failed');
  });
}

function getCollectedCons() {
  var cHeader = $('<div>',{class: 'consignments-header'})
    .css({
      display: 'grid',
      gridTemplateColumns: '120px 80px 80px 80px 140px',
      color: 'rgba(255,255,255,1)',
      backgroundColor: 'rgba(55,55,55,1)'
    });

  $.each(['Traking No','Type','Route','Location','Status'], function(i, t){
    $('<div>',{
      class: 'consignments-header-item',
      text: t
    })
      .css({padding: 4})
      .appendTo(cHeader);
  });
  
  $('#cConsignments').empty();
  $('#cConsignments').append(cHeader);

  data.received_at = $('#cDate').val();

  $.getJSON(url, data, function(json){
    $.each(json, function(i, obj) {
      if(obj.status != 'DELIVERED') {
        var cConsignment = $('<div>', {class: 'consignment'})
          .css({
            display: 'grid',
            gridTemplateColumns: '120px 80px 80px 80px 140px'
        });

        $('<div>', {'class': 'consignment-item', 'text': obj.tracking_number, 'onclick': 'showEvents(' + obj.id + ')', 'id': obj.id}).appendTo(cConsignment);
        $('<div>', {'class': 'consignment-item', 'text': obj.package_type}).appendTo(cConsignment);
        $('<div>', {'class': 'consignment-item', 'text': obj.requested_route}).appendTo(cConsignment);
        $('<div>', {'class': 'consignment-item', 'text': obj.consolidation_id}).appendTo(cConsignment);
        $('<div>', {'class': 'consignment-item', 'text': obj.status}).appendTo(cConsignment);
        $('#cConsignments').append(cConsignment);
      };
    });
    $('.consignment-item').css({padding: 4});
  })
    .fail(function(){
      console.log('Consignments Request Failed');
  });    
}

function addPartsToDOM(){
  $('#cInsert').remove();
  var cInsert = $('<div>',{'id':'cInsert'})
    .append($('<input>', {'id':'cDate', 'type':'date'}))
    .append($('<button>', {'id': 'cButton', 'text': 'Lookup Collections', 'onclick': 'getCollectedCons()'}))
    .append($('<div>', {'id': 'cConsignments'}).css({width: 580, margin: '0 auto'}))
    .append($('<div>', {'id':'cAudits', 'style':'display:none'}));
  $('#breadcrumbs').after(cInsert);
	$('#cDate').css({lineHeight: '1.2em', marginLeft: 20});
	$('#cButton').css({lineHeight: '1.3em',marginLeft: 4});
	$('#cAudit').click(function(){
    $(this).fadeOut();
  })
  .css({position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.75)', zIndex: '999'});
};

$.when($.ready).then(function() {
	addPartsToDOM();
});
