pingHost = msg => {
  console.log('SpiderEvent:' + msg)
}

document.addEventListener("DOMContentLoaded", function (event) {
  document.addEventListener('click', function (e) {
    const event = {
        x:e.pageX,
        y:e.pageY,
        target:getSelector(e.target)
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

var getSelector = function(el) {
  if (el.tagName.toLowerCase() == "html")
      return "html";
  var str = el.tagName.toLowerCase();
  str += (el.id != "") ? "#" + el.id : "";
  if (el.className) {
      var classes = el.className.trim().split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
          str += "." + classes[i]
      }
  }
  
  if(document.querySelectorAll(str).length==1) return str;
  
  return getSelector(el.parentNode) + " > " + str;
}