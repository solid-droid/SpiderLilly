let recording = false;
let highlightRec = false;
let overlayHighlight = false;
let FinalData = {};
let mouseMove, mouseClick;
let recordingName;
let configFile={};

$(document).ready(() => {
  const webview = $('#web')

  attachUIButtons(webview);
  attachEvents(webview);
  attachCanvasEvents();
  window.electronAPI.getMessages();
})

function removeActive(){
    $('#testButton').removeClass('active')
    $('#recModeButton').removeClass('active')
    $('#highlightModeButton').removeClass('active')
    $('#compareButton').hide();
    $('#viewButton').hide();
    $('#recButton').hide();
    $('.highlightButtonGroup').hide();
    showReporterMask(false);
}

function getURL(url){
    if(!url){
        url = $('#urlInput').val();
    }

    if(!(url.startsWith('http://') || url.startsWith('https://'))){
        url = 'https://'+ url;
    } 
    $('#urlInput').val(url);
    return url;
}

function getOutputPath(){
    return $('#outputDir').val();
}

function showReporterMask(show = true){
    if(show){
        $('#mask1').css({
            display:'flex'
        });
    } else{
        $('#mask1').hide();
    }

}

function scriptToCode(script){
    let code ='(async function(){';
    script.forEach(x => {
        switch (x.action){
            case 'type': code +=`document.querySelector("${x.selector}").value = "${x.value}";`;
            break;
            case 'click': code +=`document.querySelector("${x.selector}").click();`;
            break;
            case 'wait': code+=`await new Promise(r => setTimeout(r, "${x.value}"));`;
            break;
        }
    });
    code += '})();';
    console.log(code);
    return code;
}

function attachUIButtons(webview){
    let recordingURL; 
    $('#scriptButton').on('click', ()=>{
        if(configFile?.init?.script?.length && configFile?.init?.url?.includes(webview[0].getURL())){
            const code = scriptToCode(configFile.init.script);
            webview[0].executeJavaScript(code);
        }
    });

    $('#goButton').on('click', ()=>{
        webview[0].loadURL(getURL())
    });

    $('#urlInput').on('keyup', function (e) {
        if (e.keyCode === 13) {
            webview[0].loadURL(getURL())
        }
      })

    $('#compareButton').on('click', ()=>{
        configFile.highlights = highlights;
        window.electronAPI.compare({
            configFile:configFile,
            output:getOutputPath(),
            zoomFactor:1920/$('#web').width()
        });
    });

    $('#testButton').on('click', () => {
        if(!$('#testButton').hasClass('active')){
            removeActive();
            $('#testButton').addClass('active');
            $('#compareButton').show();
            $('#viewButton').show();
        }else{
            // removeActive();
        }
    });
    $('#recModeButton').on('click', () => {
        if(!$('#recModeButton').hasClass('active')){
            removeActive();
            $('#recModeButton').addClass('active');
            $('#recButton').show();
            $('#web').show();
            $('#player').hide();
            $('#canvas').hide();
        } else{
            // removeActive();
        }
    });

    $('#highlightModeButton').on('click', () => {
        if(!$('#highlightModeButton').hasClass('active')){
            removeActive();
            let status = $('#logsBox').text();
            $('#highlightModeButton').addClass('active');
            $('.highlightButtonGroup').css({
                'display':'flex'
            });
            $('#web').hide();
            ///testing
            recordingName = '1731804810478';
            status = 'Recording Success';
            ///
            $('#player').attr('src',getOutputPath()+'\\'+recordingName+'.mp4')
            $('#player').show();
            $('#canvas').show();
            if(!recordingName ||  status !== 'Recording Success'){
                showReporterMask();
            }
        }else{
            // removeActive();
        }
    });

    
    $('#penButton').on('click',()=>{
        highlightRec = !highlightRec;
        if(highlightRec){
            $('#penButton .blink').show();
        } else {
            $('#penButton .blink').hide();
        }
    });
    $('#OverlayButton').on('click',()=>{
        overlayHighlight = !overlayHighlight;
        if(overlayHighlight){
            $('#OverlayButton .enabled').show();
        } else {
            $('#OverlayButton .enabled').hide();
        }
    });

    $('#clearButton').on('click', ()=>{
        highlights = [];
    });

    $('#recButton').on('click',()=>{
        recording = !recording;
        if(!recording){
            $('#recButton .blink').hide();
            FinalData = optimizeRecording(FinalData);
            window.electronAPI.runSimulation({
                url:recordingURL,
                data:FinalData,
                recordingName:recordingName,
                configFile:configFile,
                output:getOutputPath(),
            });
        } else {
            $('#recButton .blink').show();
            $('#logsBox').text('Recording Started');
            recordingURL = webview[0].getURL();
            recordingName = Date.now();
            beginRecording();
        }
        FinalData = {};
      });
}

function attachEvents(webview){

    window.electronAPI.onHelperMessage(message => {
        const output = 'output:';
        const config = 'config:';
        const configData ='configData:'
        if (message.startsWith(output)) {
            let code = message.substr(output.length)
            $('#outputDir').val(code);
        }
        if (message.startsWith(config)) {
            let code = message.substr(config.length)
            $('#configFilePath').val(code);
        }
        if (message.startsWith(configData)) {
            configFile = JSON.parse(message.substr(configData.length));
        }
    });
    window.electronAPI.onStatusMessage(value => {
        $('#logsBox').text(value);
    });

    webview.on('dom-ready', () => {
        let zoomFactor = $('#web').width()/1920;
        webview[0].setZoomFactor(zoomFactor);
        new ResizeObserver(() => {
            let zoomFactor = $('#web').width()/1920;
            webview[0].setZoomFactor(zoomFactor);
          }).observe(document.body)

    });
    webview[0].addEventListener('console-message', ({ message = '' }) => {
        const click = 'click:';
        const move = 'move:';
        if (message.startsWith(click)) {
            let code = JSON.parse(message.substr(click.length))
            mouseClick = {...code, type:'click'};
            $('#code').text(`${code.x},${code.y} | click : ${code.target}`);
            // showClickMask();
        }
        if (message.startsWith(move)) {
            let code = JSON.parse(message.substr(move.length))
            mouseMove = {...code,type:'move'};
            $('#code').text(`${code.x},${code.y}`);
        }
        
    });
}

async function showClickMask(){
    if(recording){
        let counter = 2;
        let microCounter = 0;
        $('.counterText').text('2');
        $('#mask2').css({display:'flex'});
        while(counter > 0){
            await new Promise(r => setTimeout(r,55));
            microCounter+=1;
            if(microCounter > 20){
                $('.counterText').text(--counter);
                microCounter = 0;
            }

        }
        $('#mask2').hide();
    }
}


async function beginRecording (){
    while(recording){
        FinalData.mouse ??= [];
        if(mouseClick){
            FinalData.mouse.push(mouseClick);
            mouseClick = null;
        }
        if(mouseMove){
            FinalData.mouse.push(mouseMove);
        }
        await new Promise(r => setTimeout(r, 30));
    }
}

function optimizeRecording(data){
    let mouse = [], prevX, prevY, prevType;
    data?.mouse.forEach(item => {
        if(!mouse.length){
            mouse.push(item);
        }
        if(prevX === item.x && prevY === item.y && prevType === item.type){
            mouse[mouse.length-1].count ??= 0;
            mouse[mouse.length-1].count += 1;
        } else {
            prevX = item.x;
            prevY = item.y;
            prevType = item.type
            mouse.push(item);
        }
    });
    data.mouse = mouse;
    return data;
}