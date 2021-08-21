import SpeechToTextRepository from "../../repositories/implementations/SpeechToTextRepository";
import SpeechToTextController from "./SpeechToTextController";
import SpeechToTextServer from "./SpeechToTextServer";

const speechToTextController = new SpeechToTextController(
  new SpeechToTextRepository()
  )

const speechToTextServer = new SpeechToTextServer(
  new SpeechToTextRepository()
  )

export { speechToTextController, speechToTextServer }