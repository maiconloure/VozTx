import app from "./app";
import env from '../../../config/env'

const host = env.HOST || 'http://localhost'
const port = env.PORT || '8080'

app.listen(8080, () => {
    console.info(`⚡️⚡️⚡️[SPEECH_TO_TEXT_API]⚡️⚡️⚡️: Server is running at ${host}:${port}`)
})