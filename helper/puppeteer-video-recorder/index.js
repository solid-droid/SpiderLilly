const { FsHandler } = require('./handlers');
const { exec } = require('child_process');
const PuppeteerMassScreenshots = require('puppeteer-mass-screenshots');

class PuppeteerVideoRecorder {
    constructor(){
        this.screenshots = new PuppeteerMassScreenshots();
        this.fsHandler = new FsHandler();
    }

    async init(page, outputFolder, videoFilename){
        this.page = page;
        this.outputFolder = outputFolder;
        await this.fsHandler.init(outputFolder, videoFilename);
        const { imagesPath,imagesFilename, appendToFile } = this.fsHandler;
        await this.screenshots.init(page, imagesPath, {
            afterWritingImageFile: (filename) => appendToFile(imagesFilename, `file '${filename}'\n`)
        });
    }             

    start(options = {}) { 
        return this.screenshots.start(options);
    }
    
    async stop (ffmpegCommand) {
    	await this.screenshots.stop();
    	return this.createVideo(ffmpegCommand);
    }

    get defaultFFMpegCommand() {
        const { imagesFilename, videoFilename } = this.fsHandler;
        return [
            '.\\ffmpeg\\bin\\ffmpeg.exe',
            '-f concat',
            '-safe 0',
            `-i ${imagesFilename}`,
            '-framerate 60',
            videoFilename
        ].join(' ');
    }

    createVideo(ffmpegCommand = '') {
        const _ffmpegCommand = ffmpegCommand || this.defaultFFMpegCommand;
        exec(_ffmpegCommand, (error, stdout, stderr) => {
            if (error) throw new Error(error);
            console.log(stdout);
            console.log(stderr);
        });
    }
}

module.exports = PuppeteerVideoRecorder;
