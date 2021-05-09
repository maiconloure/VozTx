import { AxiosResponse } from "axios";

export interface ISpeechToTextRepository {
  getAudioFile(url: string): Promise<Record<string, AxiosResponse<any>|string>>
}