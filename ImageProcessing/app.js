const ffmpeg = require('fluent-ffmpeg');
const {Jimp} = require('jimp');
const fs = require('fs');

async function compareHighlights(event, {configFile={}, output='', zoomFactor=1}, win, sendStatus){
    var outputPath = output && output !== '' ? output : path.join(__dirname,'').replace('resources\\app.asar\\Simulation','')+'Output';
    let videoPath = configFile.workingVideo;
    let highlights = configFile.highlights;
    if(highlights && highlights.length && videoPath){
        const {timestamps, boxes} = parseHighlights(highlights, zoomFactor);
        await createFrames(outputPath, videoPath, timestamps);
        await createHighlights(outputPath, timestamps, boxes);
    }
    sendStatus(win, 'Test Complate');
}

async function createHighlights(outputPath,timestamps, boxes){
    var dir =outputPath+'cropped';
    if (fs.existsSync(dir)){
        fs.rmSync(dir, { recursive: true, force: true });     
    }
    fs.mkdirSync(dir, { recursive: true });

    for(let i =0; i<timestamps.length; ++i){
        let time = timestamps[i];
        let path = outputPath+`frames/img-${time}.png`;
        let img = await Jimp.read(path);
        img.crop(boxes[i])
        img.write(dir+`/box-${i}-${time}.png`)
    }
}
function parseHighlights(highlights, zoomFactor){
    let timestamps = [];
    let boxes = [];
    highlights.forEach(entry => {
        timestamps.push(entry.time);
        let x = entry.c1.x * zoomFactor;
        let y = entry.c1.y * zoomFactor;
        let w = entry.c2.x * zoomFactor - x;
        let h = entry.c2.y * zoomFactor - y;
        boxes.push({x,y,w,h});
    });
    return {timestamps, boxes};
}

async function createFrames(outputPath, video, timestamps){
    var dir =outputPath+'frames';
    if (fs.existsSync(dir)){
        fs.rmSync(dir, { recursive: true, force: true });     
    }
    fs.mkdirSync(dir, { recursive: true });
    ffmpeg.setFfmpegPath('.\\ffmpeg\\bin\\ffmpeg.exe')
    ffmpeg(outputPath+video)
    .screenshots({
      timestamps: timestamps,
      filename: 'img-%s.png',
      folder: dir,
      size: '1920x1080'
    });
    let count  = 0;
    let framesCount = new Set(timestamps).size;
    while(count < framesCount){
        fs.readdir(dir, (err, files) => {
            count = files.length;
        });
        await new Promise(r => setTimeout(r,500));
    }
}


let outputPath = 'D:/Projects/SpiderLilly/output/';
let vid = '1731559757708.mp4';

module.exports = {compareHighlights};