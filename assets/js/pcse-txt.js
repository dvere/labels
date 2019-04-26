function getTrackingId(orderId, edDate, items, tab) {
  let pcseData = { tab: tab};
  if (edDate != 'TBA') { 
    edDate = edDate.split('/').reverse().join('-');
    pcseData.DateRangeStart = pcseData.DateRangeEnd = edDate;
    pcseData.SearchOn = 5; 
  }
  let pcseInit = {
    url: '/portal/Logistics/Orders',
    xhrFields: {
      withCredentials: true
    },
    method: 'GET',
    dataType: 'html',
    data: pcseData
  }
  $.ajax(pcseInit).done(function(data) {
    return $(data).text();
  }).then(function(text) {
    return $(text).find('tr:contains('+ orderId +')').children().eq(9);
  }).then(function(td) {
    items.unshift($(td).html().split('<br>').sort().reverse()[0]);
    doLabels(items);
  });
}

function doLabels(items) {
  var fmt = '^XA^DFR:DELIVERY.GRF^PON' +
    '^FO5,5^GB780,1200,4^FS' +
    '^FO5,240^GB780,860,3^FS' +
    '^FO5,420^GB480,180,3^FS' +
    '^FO482,240^GB302,360,3^FS' +
    '^FO5,660^GB780,1,3^FS' +
    '^FO5,820^GB780,1,3^FS' +
    '^FO5,970^GB780,1,3^FS' +
    '^FO215,60^BY2^BCN,150,N^FN0^FS' +
    '^FO5,25^A0N,30^FB780,1,0,C^FN0^FS' +
    '^FO15,275^A0N,140^FB480,1,0,C^FN1^FS' +
    '^FO15,455^A0N,140^FB480,1,0,C^FN2^FS' +
    '^FO500,365^A0N,140^FB280,1,0,C^FN3^FS' +
    '^FO5,615^A0N,40^FB780,1,0,C^FN4^FS' +
    '^FO15,700^A0N,100^FB780,1,0,C^FN6^FS' +
    '^FO150,840^A0N,24^FN4^FS' +
    '^FO150,870^A0N,24^FN5^FS' +
    '^FO150,900^A0N,24^FN6^FS' +
    '^FO15,1000^A0N,100^FB780,1,0,C^FN8^FS' +
    '^FO170,1120^BY2^BCN,55,Y^FN7^FS^XZ';

  var ls = '^XA^XFR:DELIVERY.GRF^FS';
  var le = '^XZ';
  var qty = items.pop(),
    fileName = items[7];
  items = items.map(function(value, index) {
    return '^FN' + index + '^FD' + value + '^FS';
  });
  var lm = items.join(''), tt = '';
  for (var i = qty; i > 0; i--) {
    tt += ls + lm + '^FN8^FDPieces: ' + i + ' of ' + qty + '^FS' + le;
  }

  var zpl = fmt + tt;

  var saveData = (function () {
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    return function (data, fileName, type) {
      var blob = new Blob([data], {type: type}),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  }());

  saveData(zpl, fileName, 'text/plain');

}

$.when($.ready).then(function() {
  var tab;
  if (window.location.pathname.split('/')[3] != 'Order') return;
  var status = $('#OrderStatusId').val();
  if ( status == 141560002 ) {
    tab = 'ReadyForDespatch';
  }
  else if (status == 141560003) {
    tab = 'Despatched';
  }
  else if (status == 100001) {
    tab = 'Complete';
  }
  else {
    return;
  }
  var qty = prompt("Enter number of packages:", 1);
  if (qty == null || qty == "" || isNaN(qty)) {
    console.log("Input quantity error or cancelled by user");
    return;
  };
  var serviceCentres = {
    BASINGSTOKE: 'BS', BECKTON: 'CV', BIRMINGHAM: 'BP', BRISTOL: 'BL',
    CAMBRIDGE: 'CB', GATWICK: 'CW', LEEDS: 'LD', LETCHWORTH: 'LE',
    MANCHESTER: 'MA', MEDWAY: 'ME', MILTON: 'MK', NEWCASTLE: 'NE',
    NORWICH: 'NR', NOTTINGHAM: 'NG', PLYMOUTH: 'PL', READING: 'NB',
    SLOUGH: '3S', SOUTHAMPTON: 'SO', SWINDON: 'SW', TELFORD: 'TF',
    WARWICK: 'MC'
  };
  var orderId = $('h3').eq(0).text().trim().split(' ')[2];
  var svc = $('nav.account-links').find('li').eq(1).text().trim();
  var svcCode = serviceCentres[svc.substr(0,svc.indexOf(' ')).toUpperCase()];
  var orderDetail = {};

  $('.pcss-order-summary').find('.col-md-5').each(function( i, e ) {
    var v =  $('.pcss-order-summary').find('.col-md-7').eq(i).text().trim();
    orderDetail[$(e).text()] = v;
  });

  var edDate = orderDetail['Expected Delivery Date'];
  var address = orderDetail['Shipping Address'].split(',');
  var address_1 = address.shift();
  var postcode = address.pop();

  var items = [
    orderDetail['Delivery Route And Stop'].substr(0,4),
    orderDetail['Location Code'],
    svcCode,
    address_1,
    address,
    postcode,
    orderId,
    qty
  ];
  getTrackingId(orderId, edDate, items, tab);
});
