import Fs from 'fs';
import Axios, { AxiosResponse } from 'axios'

export default class SpeechToTextRepository {
  public async getAudioFile(url: string):Promise<Record<string, AxiosResponse<any>|string>> {
    const filename = url.match(/(?=\w+\.\w{3,4}$).+/)
    console.log(filename)
    const path = `src/modules/SpeechToText/temp_files/${filename}`
    const writer = Fs.createWriteStream(path)

    const response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve({response, path}))
      writer.on('error', () => reject({response, path}))
    })
  }
}