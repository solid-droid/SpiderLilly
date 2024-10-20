let recording = false;
let FinalData = {};
$(document).ready(() => {
  const webview = $('#web')
  $('#Record').on('click',()=>{
    recording = !recording;
    if(!recording){
        window.electronAPI.runSimulation({
            url:'https://github.com/',
            data:FinalData,
            options:{
                offsetY:50
            }
        });
    } else {
        $('#Status').text('Recording Started');
    }
    FinalData = {};
  });
  attachEvents(webview);
})

function attachEvents(webview){

    window.electronAPI.onStatusMessage(value => {
        $('#Status').text(value);
    });

    webview.on('dom-ready', () => {
        webview[0].setZoomFactor(0.7);
    });

    webview[0].addEventListener('console-message', ({ message = '' }) => {
        const click = 'click:';
        const move = 'move:';
        if (message.startsWith(click)) {
            let code = message.substr(click.length)
            $('#code').text(code);
        }
        if (message.startsWith(move)) {
            let code = message.substr(move.length)
            addToRecording(move,JSON.parse(code));
            $('#code').text(code);
        }
        
    });
}

let addToRecording = throttle(function(type,data){
    if(recording){
        if(type==='move:'){
            FinalData.mouse ??= [];
            FinalData.mouse.push(data)
        }
    }
},100);