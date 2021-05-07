import { Request, Response } from "express"
import Recognizer from '../../../Recognizer'
const recognizer = new Recognizer()

export default class SpeechToTextController {
  constructor(
    private speechToTextRepository: any,
) { }

  public async index(req: Request, res: Response) {
    const queryParams = req.query
    console.log(queryParams)
    const audioFile = await this.speechToTextRepository.getAudioFile(req.query.audio, req.query.filename)

    const result = recognizer.index('src/modules/SpeechToText/temp/common_voice_pt_19277058.mp3')
    return res.send({})
  }
}
