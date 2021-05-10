import app from "./app";
import env from '../../../config/env'

app.listen(env.PORT || 8080, () => {
    console.info(`⚡️⚡️⚡️[SPEECH_TO_TEXT_API]⚡️⚡️⚡️: Server is running at ${env.HOST}:${env.PORT}`)
})