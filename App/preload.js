pingHost = msg => {
  console.log('SpiderEvent:' + msg)
}

document.addEventListener("DOMContentLoaded", function (event) {
  document.addEventListener('click', function (e) {
    const event = {
        x:e.pageX,
        y:e.pageY
    }
    const _event = JSON.stringify(event);
    console.log('click:' + _event)
  }, true);

  document.addEventListener("mousemove", (e) => {
    const event = {
        x:e.pageX,
        y:e.pageY
    }
    const _event = JSON.stringify(event);
    console.log('move:' + _event)
  });
});