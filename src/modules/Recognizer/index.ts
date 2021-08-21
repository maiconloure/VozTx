/* eslint-disable @typescript-eslint/no-var-requires */
const vosk = require('../SpeechToText/providers/vosk')
import { spawn } from 'child_process'

export default class Recognizer {
  private model: string
  private sampleRate: number
  private bufsize: number

  constructor() {
    this.model = "src/model"
    this.sampleRate = 16000
    this.bufsize = 4000
  }

  public async index (audioFile: string): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      let textResult: string
      vosk.setLogLevel(0)
      const model = new vosk.Model(this.model)
      const rec = new vosk.Recognizer({model: model, sampleRate: this.sampleRate})

      const ffmpeg_run = spawn('ffmpeg', ['-loglevel', 'quiet', '-i', audioFile,
                              '-ar', String(this.sampleRate) , '-ac', '1',
                              '-f', 's16le', '-bufsize', String(this.bufsize) , '-'])


      ffmpeg_run.stdout.on('data', (stdout: any) => {
        if (rec.acceptWaveform(stdout)) {
          textResult = rec.result().text
        }
        else { 
          rec.partialResult()
        }
      })

      ffmpeg_run.on('error', (error) => {
          reject({success: false, result: error})
      })

      ffmpeg_run.on('close', () => {
          resolve({success: true, result: textResult})
      })
    })
  }
}