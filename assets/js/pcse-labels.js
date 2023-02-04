var serviceCentres = {
  BASINGSTOKE: 'BS', BECKTON: 'CV', BIRMINGHAM: 'BP', BRISTOL: 'BL',
  CAMBRIDGE: 'CB', GATWICK: 'CW', LEEDS: 'LD', LETCHWORTH: 'LE',
  MANCHESTER: 'MA', MEDWAY: 'ME', MILTON: 'MK', NEWCASTLE: 'NE',
  NORWICH: 'NR', NOTTINGHAM: 'NG', PLYMOUTH: 'PL', READING: 'NB',
  SLOUGH: '3S', SOUTHAMPTON: 'SO', SWINDON: 'SW', TELFORD: 'TF', WARWICK: 'MC'
}
var fileType = localStorage.getItem('data-file-type') || 'raw'
var labelType = localStorage.getItem('data-label-type') || 3
var path = document.location.pathname.split('/')[3]
var orderStatus = document.getElementById('order-status').value
var labelStart = '\n\n^XA^XFR:DELIVERY.ZPL\n'
var labelEnd = '\n^XZ\n'
var tabs = ['Complete', 'ReadyForDespatch', 'Despatched']

function Template () {
  let format3 = `^LH25,25
^FO400,15^GB160,80,80,,0^FS
^FO10,30^BY2,3,60^BCN,60,Y,Y^FN0^FS
^FO400,120^A0N,80^FN1^FS
^FO400,220^A0N,60^FN2^FS
^FO410,25^A0N,80^FR^FN3^FS
^FO10,180^A0N,25^FN4^FS
^FO10,120^A0N,50^FN5^FS
^FO60,320^BY2,3,60^BCN,60,Y,Y^FN6^FS
^FO10,220^A0N,50^FN8^FS`

  let format4 = `^LH20,16
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
^FO15,700^A0N,100^FB780,1,0,C^FN5^FS
^FO150,840^A0N,24^FN4^FS
^FO150,870^A0N,24^FN7^FS
^FO150,900^A0N,24^FN5^FS
^FO15,1000^A0N,100^FB780,1,0,C^FN8^FS
^FO170,1120^BY2^BCN,55,Y^FN6^FS`
  
  let format6 = `^LH36,36
^FO600,24^GB240,120,120,,0^FS
^FO15,45^BY3,3,90^BCN,90,Y,Y^FN0^FS
^FO600,180^A0N,120^FN1^FS
^FO600,330^A0N,90^FN2^FS
^FO615,36^A0N,120^FR^FN3^FS
^FO15,270^A0N,36^FN4^FS
^FO15,180^A0N,64^FN5^FS
^FO90,460^BY3,3,90^BCN,90,Y,Y^FN6^FS
^FO10,330^A0N,75^FN8^FS`

  this.zpl = '^FX ' + new Date().toISOString() + '\n^XA\n^DFR:DELIVERY.ZPL\n'

  if (labelType == 6) {
    this.zpl += format6
  } else if (labelType == 4) {
    this.zpl += format4
  } else {
    this.zpl += format3
  }
  this.zpl += labelEnd
}

function checkStatus (orderStatus, path) {
  return (tabs.includes(orderStatus) && path === 'Order')
}

function checkQty (qty) {
  qty = parseInt(qty)
  return !(qty === 0 || qty == null || isNaN(qty))
}

function Order () {
  this.detail = new Details()
  this.orderStatus = orderStatus
  this.itemsArray = [
    this.detail['Delivery Route And Stop'].substr(0,4),
    this.detail['Location Code'],
    this.detail.svcCode,
    this.detail.address_1,
    this.detail.postcode,
    this.detail.id
  ]
  if (labelType == 4) {
    this.itemsArray.push(this.detail.address)
  }
}

function Details () {
  var svc = $('nav.account-links').find('li').eq(1).text().trim()
  var self = this
  $('div.col-md-5').each(function( i, e ) {
	self[e.innerText] = e.nextElementSibling.innerText
  })
  this.id = $('h3').eq(0).text().trim().split(' ')[2]
  this.svcCode = serviceCentres[svc.substr(0,svc.indexOf(' ')).toUpperCase()]
  this.address = this['Shipping Address'].split(',')
  this.address_1 = this.address.shift()
  this.postcode = this.address.pop()
}

function getCons(order) {
  var p = {tab: order.orderStatus}
  
  var e = order.detail['Expected Delivery Date']
  if (e !== 'TBA') { 
    e = e.split('/').reverse().join('-')
    p.DateRangeStart = p.DateRangeEnd = e
    p.SearchOn = 5
  }

  let url = '/portal/Logistics/Orders?' + $.param(p)
  let req = new Request(url, {credentials: 'include', method: 'GET'})
  fetch(req)
  .then(response => response.text())
  .then(html => $(html).find('tr:contains('+ order.detail.id +')'))
  .then(row => $(row).find('td').eq(9)[0].innerHTML.split('<br>').sort().reverse()[0])
  .then(tn => {
    clipboardTn(tn, order.detail.id)
    .then(() => {
      order.itemsArray.unshift(tn)
      var label = new Label(order.itemsArray)
      doOutput(label)
    })
  })
}

async function clipboardTn(tn, id) {
  try {
    await navigator.clipboard.writeText(tn)
    logger(`Tracking number ${tn} copied for ${id}`)
  } catch (err) {
    logger(`Failed to copy: ${tn} - ${id}`, err)
  }
}

function doOutput(l) {
  if (l.format === 'application/pdf') {
    zpl2pdf(l)
  } else {
    if (l.filename) {
      labelDownload(l)
    } else {
      labelPrint(l)
    }
  }
}

function Label (items) {
  let template = new Template()
  let qty = items.pop()
  let commonFields = items.map(function(v, i) {
    return '^FN' + i + '^FD' + v + '^FS'
  }).join('\n')
  let pkgLabels = '';

  for (var i = qty; i > 0; i--) {
    let label = labelStart + commonFields +
      '\n^FN8^FDPiece: ' + i + ' of ' + qty +
      '^FS' + labelEnd
    pkgLabels += label
  }
    this.data = template.zpl + pkgLabels
    this.cons = items[0]

  switch (fileType) {
    case 'txt':
      this.filename = setFileName(items)
      this.format = 'text/plain'
      break;
    case 'pdf':
      this.filename = setFileName(items)
      this.format = 'application/pdf'
      break;
    default:
      break;
  }
}

async function zpl2pdf (l) {
  let fd = new FormData()
  let labeler = 'https://lab1.dvere.org/l/'

  let zpl = l.data.replaceAll('\n','').replaceAll('LH25,25','LH15,10')
  fd.append('file', zpl)

  let init = {
    method: 'POST',
    mode: 'cors',
    body: fd,
    credentials: 'omit'
  }

  const blob = await fetch(labeler, init)
  .then(r => r.blob())
  
  const url = URL.createObjectURL(blob)
  const pw = window.open(url)
  pw.focus()
  pw.onload = () => pw.print()
  URL.revokeObjectURL(url)
}

function labelPrint(printObject) {
    let printWindow = window.open()
    printWindow.document.open()
    printWindow.document.write('<pre>' + printObject.data + '</pre>')
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
}

function setFileName (items) {
      return items[1] + '_' + items[6]
}

function labelDownload (labelObject) {
    let a = document.createElement('a')
    let blob = new Blob([labelObject.data], { type: labelObject.format })
    let url = window.URL.createObjectURL(blob)
    a.style = 'display: none'
    a.href = url
    a.download = labelObject.filename
    a.click()
    window.URL.revokeObjectURL(url)
}

$.when($.ready).then(function() {

  if (!checkStatus(orderStatus,path)) return;

  if (!localStorage['data-label-type']) {
    let large = confirm('Label size is not set\nDo you want to use large (UPS) labels?')
    let size = (large)? 4: 3;
    localStorage.setItem('data-label-type', size)
  }

  var qty = prompt("Enter number of packages:", 1)

  if (!checkQty(qty)) return;

  var order = new Order(orderStatus)
  order.itemsArray.push(qty)
  getCons(order)
})
