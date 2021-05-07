import SpeechToTextRepository from "../../repositories/SpeechToTextRepository";
import SpeechToTextController from "./SpeechToTextController";

const speechToTextController = new SpeechToTextController( new SpeechToTextRepository())

export { speechToTextController }