const serviceCentres = {
  BASINGSTOKE: 'BS', BECKTON: 'CV', BIRMINGHAM: 'BP', BRISTOL: 'BL',
  CAMBRIDGE: 'CB', GATWICK: 'CW', LEEDS: 'LD', LETCHWORTH: 'LE',
  MANCHESTER: 'MA', MEDWAY: 'ME', MILTON: 'MK', NEWCASTLE: 'NE',
  NORWICH: 'NR', NOTTINGHAM: 'NG', PLYMOUTH: 'PL', READING: 'NB',
  SLOUGH: '3S', SOUTHAMPTON: 'SO', SWINDON: 'SW', TELFORD: 'TF',
  WARWICK: 'MC'
};

var labelTemplate = `
^FX ${new Date().toISOString()}
^XA^DFR:DELIVERY.GRF
^FO5,5^GB780,1200,4^FS
^FO5,240^GB780,860,3^FS
^FO5,420^GB480,180,3^FS
^FO482,240^GB302,360,3^FS
^FO5,660^GB780,1,3^FS
^FO5,820^GB780,1,3^FS
^FO5,970^GB780,1,3^FS
^FO215,60^BY2^BCN,150,N^FN0^FS
^FO5,25^A0N,30^FB780,1,0,C^FN0^FS
^FO15,275^A0N,140^FB480,1,0,C^FN1^FS
^FO15,455^A0N,140^FB480,1,0,C^FN2^FS
^FO500,365^A0N,140^FB280,1,0,C^FN3^FS
^FO5,615^A0N,40^FB780,1,0,C^FN4^FS
^FO15,700^A0N,100^FB780,1,0,C^FN6^FS
^FO150,840^A0N,24^FN4^FS
^FO150,870^A0N,24^FN5^FS
^FO150,900^A0N,24^FN6^FS
^FO15,1000^A0N,100^FB780,1,0,C^FN8^FS
^FO170,1120^BY2^BCN,55,Y^FN7^FS
^XZ`;

var fileType = localStorage.getItem(data-file-type) || 'raw';

class Label {
  constructor(order) {
    items = order.items;
    labelStart = '\n\n^XA^XFR:DELIVERY.GRF\n';
    labelEnd = '^XZ';
    pieces = items.pop();
    commonFields = items.map(function(v, i) {
      return '^FN' + i + '^FD' + v + '^FS';
    }).join('\n');
    pkgLabels = '';

    for (var i = pieces; i > 0; i--) {
      let label = labelStart + commonFields +
        '\n^FN8^FDPieces: ' + i + ' of ' + pieces +
        '^FS\n' + labelEnd;
      pkgLabels += label;
    }
    this.data = labelTemplate + pkgLabels;
  }

  zpl2pdf() {
    var fd = new FormData(),
        url = 'https://lab1.dvere.org/l/';

    fd.append('file',this.data);

    var init = {
      method: 'POST',
      headers: {
        'Accept': 'application/pdf'
      },
      mode: 'cors',
      body: fd,
      credentials: 'omit'
    };

    fetch(url, init)
    .then(response => response.blob())
    .then(data =>  {
      this.data = data;
    });
  }

  print() {
    var printWindow = window.open();
    printWindow.document.open(this.format)
    printWindow.document.write(this.data);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  setFileName() {
     this.filename = this.items[1] + '_' + this.items[7];
  }

  download() {
    var a = document.createElement('a'),
      blob = new Blob([this.data], { type: this.format }),
      url = window.URL.createObjectURL(blob);
    a.style = 'display: none';
    a.href = url;
    a.download = this.filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}

class Order {
  constructor(tab, edDate, items) {
    this.tab = tab;
    this.edDate = edDate;
    this.items = items;
  }

  getTrackingNumber() {
    let p = {tab: this.tab},
      e = this.edDate;

    if (e != 'TBA') { 
      e = e.split('/').reverse().join('-');
      p.DateRangeStart = p.DateRangeEnd = e;
      p.SearchOn = 5; 
    }

    let url = '/portal/Logistics/Orders?' + $.param(p),
      req = new Request(url, {credentials: include, method: 'GET'});

    fetch(req)
    .then(resp => resp.text())
    .then(html => $(html).find('tr:contains('+ order.id +')').children().eq(9))
    .then(td => {
      this.items.unshift($(td).html().split('<br>').sort().reverse()[0]);
    })
  }
}

function actionLabels(){
  label = new Label(order);

  switch (fileType){
    case 'txt':
      label.setFileName();
      label.format = 'text/plain';
      label.download();
      break;
    case 'pdf':
      label.zpl2pdf();
      label.format = 'application/pdf';
      label.print();
      break;
    case 'raw':
      label.format = 'text/plain';
      label.print();
      break;
  } 
}

$.when($.ready).then(function() {
  var p3 = document.location.pathname.endsWith('/Orders'),
    status = document.getElementById('order-status').value,
    tabs = ['Complete', 'ReadyForDespatch', 'Despatched'];
  if (!tabs.includes(status) || !(p3)) return;

  var qty = prompt("Enter number of packages:", 1);
  if (qty == null || qty == "" || isNaN(qty - 0)) {
    console.log("Input quantity error or cancelled by user");
    return;
  };

  var orderId = $('h3').eq(0).text().trim().split(' ')[2],
      svc = $('nav.account-links').find('li').eq(1).text().trim(),
      svcCode = serviceCentres[svc.substr(0,svc.indexOf(' ')).toUpperCase()],
      orderDetail = {};

  $('.pcss-order-summary').find('.col-md-5').each(function( i, e ) {
    var v =  $('.pcss-order-summary').find('.col-md-7').eq(i).text().trim();
    orderDetail[$(e).text()] = v;
  });

  var address = orderDetail['Shipping Address'].split(','),
      address_1 = address.shift(),
      postcode = address.pop(),
      edDate = orderDetail['Expected Delivery Date'],
      tab = status,
      items = [
        orderDetail['Delivery Route And Stop'].substr(0,4),
        orderDetail['Location Code'],
        svcCode,
        address_1,
        address,
        postcode,
        orderId,
        qty
      ];

  var order = new Order(tab, edDate, items);

  order.getTrackingNumber();
  actionLabels(order);  
});
