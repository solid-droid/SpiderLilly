const $ = require('jquery')

$(document).ready(() => {
  const $url = $('#url')
  const $go = $('#go')
  const $web = $('#web')
  $web[0].addEventListener('console-message', ({ message = '' }) => {
    const match = 'SpiderEvent:'
    if (!message.startsWith(match)) return
    
    let code = message.substr(match.length)
    $('#code').text(code);
  })

  $url.on('keyup', function (e) {
    if (e.keyCode === 13) {
      $go.click()
    }
  })
  $go.click(() => {
    $web[0].src = $url.val()
  })


})