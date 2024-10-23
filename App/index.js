let recording = false;
let FinalData = {};
$(document).ready(() => {
  const webview = $('#web')

  attachUIButtons(webview);
  attachEvents(webview);
  window.electronAPI.getMessages();
})

function removeActive(){
    $('#testButton').removeClass('active')
    $('#recModeButton').removeClass('active')
    $('#highlightModeButton').removeClass('active')
    $('#compareButton').hide();
    $('#viewButton').hide();
    $('#recButton').hide();
    $('#penButton').hide();
}

function getURL(){
    let url = $('#urlInput').val();

    if(!(url.startsWith('http://') || url.startsWith('https://'))){
        url = 'https://'+ url;
    } 
    $('#urlInput').val(url);
    return url;
}

function getOutputPath(){
    return $('#outputDir').val();
}

function attachUIButtons(webview){
    $('#goButton').on('click', ()=>{
        webview[0].loadURL(getURL())
    });

    $('#urlInput').on('keyup', function (e) {
        if (e.keyCode === 13) {
            webview[0].loadURL(getURL())
        }
      })

    $('#testButton').on('click', () => {
        if(!$('#testButton').hasClass('active')){
            removeActive();
            $('#testButton').addClass('active');
            $('#compareButton').show();
            $('#viewButton').show();
        }
    });
    $('#recModeButton').on('click', () => {
        if(!$('#recModeButton').hasClass('active')){
            removeActive();
            $('#recModeButton').addClass('active');
            $('#recButton').show();
        }
    });

    $('#highlightModeButton').on('click', () => {
        if(!$('#highlightModeButton').hasClass('active')){
            removeActive();
            $('#highlightModeButton').addClass('active');
            $('#penButton').show();
        }
    });

    $('#recButton').on('click',()=>{
        recording = !recording;
        if(!recording){
            window.electronAPI.runSimulation({
                url:getURL(),
                data:FinalData,
                output:getOutputPath(),
                options:{}
            });
        } else {
            $('#logsBox').text('Recording Started');
        }
        FinalData = {};
      });
}

function attachEvents(webview){

    window.electronAPI.onHelperMessage(message => {
        const output = 'output:';
        if (message.startsWith(output)) {
            let code = message.substr(output.length)
            $('#outputDir').val(code);
        }
    });
    window.electronAPI.onStatusMessage(value => {
        $('#logsBox').text(value);
    });

    webview.on('dom-ready', () => {
        webview[0].setZoomFactor(0.7);
    });

    webview[0].addEventListener('console-message', ({ message = '' }) => {
        const click = 'click:';
        const move = 'move:';
        if (message.startsWith(click)) {
            showMask();
            let code = JSON.parse(message.substr(click.length))
            addToRecording('mouse',{...code, type:'click'});
            $('#code').text('click detected');
        }
        if (message.startsWith(move)) {
            let code = JSON.parse(message.substr(move.length))
            addToRecording('mouse',{...code,type:'move'});
            $('#code').text(`${code.x},${code.y}`);
        }
        
    });
}

async function showMask(){
    if(recording){
        let counter = 5;
        let microCounter = 0;
        $('.counterText').text('5');
        $('.mask').css({display:'flex'});
        while(counter > 0){
            await new Promise(r => setTimeout(r,55));
            microCounter+=1;
            let data = FinalData.mouse[FinalData.mouse.length-1];
            addToRecording('mouse',{...data, type:'move'});
            if(microCounter > 20){
                $('.counterText').text(--counter);
                microCounter = 0;
            }

        }
        $('.mask').hide();
    }
}


let addToRecording = throttle(function(type,data){
    if(recording){
            FinalData[type] ??= [];
            FinalData[type].push(data)
    }
},50);