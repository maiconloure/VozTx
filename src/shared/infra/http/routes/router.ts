import path from 'path'
import { Application } from 'express'
import  { speechToTextController } from '../../../../modules/SpeechToText/useCases/STT';
import  { speechToTextServer } from '../../../../modules/SpeechToText/useCases/STT';
export default class Routes {
    public routes(app: Application): void {
        app.route('/SpeechToText').get((req, res) => speechToTextController.index(req, res))
        app.route('/STT').get((req, res) => speechToTextServer.get(req, res))
        app.route('/STT').post((req, res) => speechToTextServer.post(req, res))
        app.route('/').get((req, res) => { res.sendFile(path.join(__dirname, '../../../../../index.html')) })
    }
}