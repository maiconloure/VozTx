import { Request, Response, Application } from 'express'
import  { speechToTextController } from '../../../../modules/SpeechToText/useCases/STT';

export default class Routes {
    public routes(app: Application): void {
        app.route('/SpeechToText').get((req, res) => speechToTextController.index(req, res));
        app.route('/STT').get((req, res) => { res.sendStatus(200)});
    }
}