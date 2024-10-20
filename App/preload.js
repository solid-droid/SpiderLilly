pingHost = msg => {
  console.log('SpiderEvent:' + msg)
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener('click', e => {

    const event = {
        clientX : e.clientX,
        clientY: e.clientY,
        layerX: e.layerX,
        layerY: e.layerY,
        pageX: e.pageX,
        pageY: e.pageY,
        screenX: e.screenX,
        screenY: e.screenY,
        pointerType: e.pointerType,
        type: e.type,
        x:e.x,
        y:e.y
    }
    const _event = JSON.stringify(event);
    pingHost(_event);
  }, true);
});