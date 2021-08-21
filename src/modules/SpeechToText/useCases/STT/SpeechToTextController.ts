/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Fs from 'fs';
import { ISpeechToTextRepository } from "../../repositories/ISpeechToTextRepository";
import { Request, Response } from "express"
import Recognizer from '../../../Recognizer'
const recognizer = new Recognizer()

export default class SpeechToTextController {
  private speechToTextRepository
  constructor(speechToTextRepository: ISpeechToTextRepository) {
    this.speechToTextRepository = speechToTextRepository
   }

  public async index(req: Request, res: Response) {
    try { 
      if (!req.query.audio) {
        return res.status(400).send({ 
          message: "Invalid request, check the 'audio' parameter"
        })
      }
      const audioFile = await this.speechToTextRepository.getAudioFile(req.query.audio.toString())
      const STTResult = await recognizer.index(audioFile.path as string)
  
      console.log(STTResult)

      Fs.unlinkSync(audioFile.path as string)
      
      return res.send({
        filename: req.query.filename,
        result: STTResult.result
      })
    } catch (error) {
      return res.status(500).send({
        result: error.message
      })
    }
  }
}