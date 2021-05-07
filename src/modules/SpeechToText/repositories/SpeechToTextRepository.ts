import https from 'https';
import fs from 'fs';

export default class SpeechToTextRepository {
  public async getAudioFile(link: string, filename: string, callback: any) {
    var file = fs.createWriteStream(`src/modules/SpeechToText/temp/${filename}`);
    const request = https.get(link, (res) => { 
      res.pipe(file)
      file.on('finish', () => { 
        file.close();
      })
    })

    return file
  }
}