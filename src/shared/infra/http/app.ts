import express from 'express'
import { createServer, Server } from 'http'
import cors from 'cors'
import Routes from './routes/router'
import env from '../../../config/env'

class App {
  public express:express.Application
  public appRoutes: Routes = new Routes()

  public constructor () {
    this.express = express()
    this.middlewares()
    this.appRoutes.routes(this.express)
  }

  private middlewares (): void {
    this.express.use(express.json())
    this.express.use(cors())
  }
}

export default new App().express