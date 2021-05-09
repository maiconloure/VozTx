import SpeechToTextRepository from "../../repositories/implementations/SpeechToTextRepository";
import SpeechToTextController from "./SpeechToTextController";

const speechToTextController = new SpeechToTextController(
  new SpeechToTextRepository()
  )

export { speechToTextController }