var fmt = '\
  ${^XA^DFR:DELIVERY.GRF^PON^LH10,5\n\
    ^FO5,5^GB780,1200,4^FS\n\
    ^FO5,240^GB780,860,3^FS\n\
    ^FO5,420^GB480,180,3^FS\n\
    ^FO482,240^GB302,360,3^FS\n\
    ^FO5,660^GB780,1,3^FS\n\
    ^FO5,820^GB780,1,3^FS\n\
    ^FO5,970^GB780,1,3^FS\n\
    ^FO215,60^BY2^BCN,150,N^FN0^FS\n\
    ^FO5,25^A0N,30^FB780,1,0,C^FN0^FS\n\
    ^FO15,275^A0N,140^FB480,1,0,C^FN1^FS\n\
    ^FO15,455^A0N,140^FB480,1,0,C^FN2^FS\n\
    ^FO500,365^A0N,140^FB280,1,0,C^FN3^FS\n\
    ^FO5,615^A0N,40^FB780,1,0,C^FN4^FS\n\
    ^FO15,700^A0N,100^FB780,1,0,C^FN6^FS\n\
    ^FO150,840^A0N,24^FN4^FS\n\
    ^FO150,870^A0N,24^FN5^FS\n\
    ^FO150,900^A0N,24^FN6^FS\n\
    ^FO15,1000^A0N,100^FB780,1,0,C^FN8^FS\n\
    ^FO170,1120^BY2^BCN,55,Y^FN7^FS\n^XZ\n\
';

var serviceCentres = {
    BASINGSTOKE: 'BS',
    BECKTON: 'CV',
    BIRMINGHAM: 'BP',
    BRISTOL: 'BL',
    CAMBRIDGE: 'CB',
    GATWICK: 'CW',
    LEEDS: 'LD',
    LETCHWORTH: 'LE',
    MANCHESTER: 'MA',
    MEDWAY: 'ME',
    MILTON: 'MK',
    NEWCASTLE: 'NE',
    NORWICH: 'NR',
    NOTTINGHAM: 'NG',
    PLYMOUTH: 'PL',
    READING: 'NB',
    SLOUGH: '3S',
    SOUTHAMPTON: 'SO',
    SWINDON: 'SW',
    TELFORD: 'TF',
    WARWICK: 'MC'
};

function getTrackingId(orderId,deliveryDate,items) {

    var pcseData = { tab: 'ReadyForDespatch', SearchOn: 5 };
    pcseData.DateRangeStart = pcseData.DateRangeEnd = deliveryDate;

    var pcseInit = {
        url: '/portal/Logistics/Orders',
        xhrFields: {
            withCredentials: true
        },
        method: 'GET',
        dataType: "html",
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
    var ls = "^XA\n^XFR:DELIVERY.GRF^FS\n";
    var le = "\n^XZ";
    var qty = items.pop();

    items = items.map(function(value, index) {
        return "^FN" + index + "^FD" + value + "^FS";
    });
    var lm = items.join( "\n" );
	var i = qty;
    var tt = '';
    for (; i > 0; i--) {
        tt += ls + lm + '\n' +
            '^FN8^FDPieces: ' + i + ' of ' + qty + '^FS' + le;
    }
    // create, write, print and destroy ZPL content document
    var w = window.open("about:blank", "oframe");
    w.id = 'output';
    w.document.open();
    w.document.write("<pre>" + fmt + tt + '}$</pre>');
    w.document.close();
    w.print();
    w.close();
}

$.when($.ready).then(function() {
    var pageType = window.location.pathname.split('/')[3],
        status = $('#OrderStatusId').val();
    if  (pageType != 'Order' || status != 141560002) return;

    var qty = prompt("Enter number of packages:", 1);
    if (qty == null || qty == "" || isNaN(qty)) {
        console.log("Input quantity error");
            return;
       };
	var orderId = $('h3').eq(0).text().trim().split(' ')[2];
    var svc = $('nav.account-links').find('li').eq(1).text().trim();
    var svcCode = serviceCentres[svc.substr(0,svc.indexOf(' ')).toUpperCase()];
    var orderDetail = {};

    $('.pcss-order-summary').find('.col-md-5').each(function( i, e ) {
        var v =  $('.pcss-order-summary').find('.col-md-7').eq(i).text().trim();
        orderDetail[$(e).text()] = v;
    });

    $("<iframe>", { name: 'oframe', hidden: 'hidden' }).appendTo('body');

    var deliveryDate = orderDetail['Expected Delivery Date'];

    deliveryDate = deliveryDate.split('/').reverse().join('-');

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

    getTrackingId(orderId, deliveryDate, items);

});

