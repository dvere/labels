var dialogHTML = `
<dialog id="optsDialog">
  <form method="dialog">
    <p><label>Choose label format:
      <select id="formatSelect">
        <option value="default" selected>Choose...</option>
      </select>
    </label></p>
    <div>
      <button value="cancel">Cancel</button>
      <button id="setButton" value="default">Set Format</button>
    </div>
  </form>
</dialog>`

var dialogCSS = `
<style>
  #optsDialog {
    width:500px,
    height: 400px
  }
</style>
`

var formats = [{
  text: '3 x 2',
  value: 3
},{
  text: '4 x 6',
  value: 4
}]

$('#nav-main > nav > div > ul').append($('<li>').append($('<span>', {id: 'opts'}).text('Options')))
$('#opts').attr('title', 'Set Options').css({color: 'var(--blue)', cursor: 'pointer'})

$('main > div > div').append(dialogHTML)

for(const f of formats) {
  $('<option>', {value: f.value}).text(f.text).appendTo($('#formatSelect'))
}
let optsButton = document.getElementById('opts')
let optsDialog = document.getElementById('optsDialog')
let selectEl = optsDialog.querySelector('select')
let defaultOpt = selectEl.querySelector('option:first-child')
let setButton = optsDialog.querySelector('#setButton')

optsButton.addEventListener('click', function onOpen() {
  optsDialog.showModal()
})

selectEl.addEventListener('change', function onSelect() {
  setButton.value = selectEl.value
})
optsDialog.addEventListener('close', function onClose() {
  alert(optsDialog.returnValue)
  defaultOpt.selected = 1
  setButton.value = 'default'
})
