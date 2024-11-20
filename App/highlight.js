var clicks = [];
var highlights = [
    {
        "c1": {
            "x": 362,
            "y": 71
        },
        "c2": {
            "x": 858,
            "y": 128
        },
        "time": 5
    },
    {
        "c1": {
            "x": 538,
            "y": 310
        },
        "c2": {
            "x": 684,
            "y": 365
        },
        "time": 9
    },
    {
        "c1": {
            "x": 1164,
            "y": 280
        },
        "c2": {
            "x": 1202,
            "y": 398
        },
        "time": 9
    },
    {
        "c1": {
            "x": 451,
            "y": 157
        },
        "c2": {
            "x": 770,
            "y": 221
        },
        "time": 16
    }
];
function drawRectangle(context, _clicks){
  context.beginPath();
  context.rect(_clicks[0].x, _clicks[0].y, _clicks[1].x-_clicks[0].x, _clicks[1].y-_clicks[0].y);
  context.fillStyle = 'rgba(100,100,100,0.5)';
  context.fill();
  context.strokeStyle = "#df4b26";
  context.lineWidth = 1;
  context.stroke();
};

function drawPoints(context, _clicks){
  context.strokeStyle = "#df4b26"; 
  context.lineJoin = "round"; 
  context.lineWidth = 5; 
              
  for(var i=0; i < _clicks.length; i++){ 
    context.beginPath(); 
    context.arc(_clicks[i].x, _clicks[i].y, 3, 0, 2 * Math.PI, false); 
    context.fillStyle = '#ffffff'; 
    context.fill(); 
    context.lineWidth = 5; 
    context.stroke(); 
  }
};
  
function clearCanvas(){
    canvas.width = 1.8 * (window.innerHeight - 120); // Clears the canvas   
    canvas.height = window.innerHeight - 180;  
}


function drawHighlight(context, start, end){ 
  drawRectangle(context, [start, end]);
  drawPoints(context, [start, end]);
};

function addToHighlights(){
    if(highlightRec){
            highlights.push({
                c1:{x:clicks[0].x, y:clicks[0].y},
                c2:{x:clicks[1].x, y:clicks[1].y},
                time:Math.ceil($('#player')[0].currentTime)
            });
    }
}

function attachOverlay(context){
    let prevTime = -1;
    setInterval(() => {
        let playerTime = Math.ceil($('#player')[0].currentTime);
        if(overlayHighlight && prevTime !== playerTime){
            prevTime = playerTime;
            clearCanvas();
            if(clicks.length)
                drawHighlight(context,clicks[0], clicks[1]);
            drawActiveHighlights(context);
           
        }
    }, 100);
}

function drawActiveHighlights(context){
    if(overlayHighlight){
        let playerTime = Math.ceil($('#player')[0].currentTime);
        highlights.forEach(item => {
            if(playerTime >= item.time && playerTime < item.time + 2){
                drawHighlight(context,item.c1, item.c2);
            }
        });          
    }  
}
function attachCanvasEvents(){
    var canvas = $('#canvas');
    var context = canvas[0].getContext('2d');
    attachOverlay(context);
    var mousedown = false;
    canvas.mousedown(e => {
        clicks[0] = {
            x: e.offsetX,
            y: e.offsetY
        };
        mousedown = true;
    })
  
    canvas.mousemove(e => {
        if (mousedown) {
            clicks[1] = {
                x: e.offsetX,
                y: e.offsetY
            };
            clearCanvas();
            drawHighlight(context,clicks[0], clicks[1]);
            drawActiveHighlights(context);
        }
    })
  
    canvas.mouseup(e => {
        mousedown = false;
        clicks[1] = {
            x: e.offsetX,
            y: e.offsetY
        };
        if(clicks[0].x === clicks[1].x || clicks[0].y === clicks[1].y){
            clearCanvas();
            drawActiveHighlights(context);
        }else{
            addToHighlights();
        }
        clicks = [];
        mouseMove = false;
    })
    
    canvas.mouseleave(function (event) {
        mousedown = false;
    });
}