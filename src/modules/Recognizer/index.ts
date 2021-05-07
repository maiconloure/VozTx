var vosk = require('../SpeechToText/providers/vosk')
import { spawn } from 'child_process'

// if (!fs.existsSync(MODEL_PATH)) {
//     console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
//     process.exit()
// }

// // if (process.argv.length > 2)
//     // FILE_NAME = process.argv[2]
// FILE_NAME = 'src/modules/temp/001.wav'


export default class Recognizer {
    private model: string
    private sampleRate: number
    private bufsize: number
    
    constructor() {
        this.model = "src/modules/SpeechToText/model"
        this.sampleRate = 16000
        this.bufsize = 4000
    }

    index (audioFile: string) {
        vosk.setLogLevel(0);
        const model = new vosk.Model(this.model);
        const rec = new vosk.Recognizer({model: model, sampleRate: this.sampleRate});
        
        console.log(audioFile)
        const ffmpeg_run = spawn('ffmpeg', ['-loglevel', 'quiet', '-i', audioFile,
                                 '-ar', String(this.sampleRate) , '-ac', '1',
                                 '-f', 's16le', '-bufsize', String(this.bufsize) , '-']);
        ffmpeg_run.stdout.on('data', (stdout: any) => {
                if (rec.acceptWaveform(stdout))
                    console.log(rec.result());
                else
                console.log(rec.partialResult());
        });

        console.log(rec.finalResult());
    }
}