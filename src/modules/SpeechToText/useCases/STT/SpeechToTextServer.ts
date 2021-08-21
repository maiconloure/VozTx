/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./index.d.ts" />

import url from 'url'
import { ISpeechToTextRepository } from "../../repositories/ISpeechToTextRepository"
import { Request, Response } from "express"

import { logLevel, loadModel, transcriptFromFile, transcriptFromBuffer, freeModel } from '@solyarisoftware/voskjs'

const { getArgs } = require('../../providers/vosk/lib/getArgs')
const { setTimer, getTimer } = require('../../providers/vosk/lib/chronos')
const { info } = require('../../providers/vosk/lib/info')


export default class SpeechToTextServer {
  private speechToTextRepository
  private programName
  private debug
  private activeRequests
  private model
  private modelName
  private multiThreads

  constructor(speechToTextRepository: ISpeechToTextRepository) {
    this.speechToTextRepository = speechToTextRepository
    this.programName = 'voskjshttp'
    this.debug = false
    this.activeRequests = 0
    this.model = Object
    this.modelName = 'vosk-model-small-pt'
    this.multiThreads = true
   }

  public async get (req: Request, res: Response) {
    try {
      setTimer('loadModel')
      this.model = loadModel('./src/model')
      console.log(`Vosk model loaded in ${getTimer('loadModel')} msecs`)


      //if ( !req.url.match(/^\/transcript/) )
      // if ( !req.url.match(pathRegexp) )
      //   return errorResponse(`path not allowed ${req.url}`, 405, res)
    
      //
      // if request header accept attribute is 'text/plain'
      // response body is text, otherwise
      // response body is 'application/json'
      //
      const requestAcceptText = (req.headers.accept === 'text/plain') ? true : false
    
      // HTTP GET /transcript
        // get request query string arguments
        // https://nodejs.org/en/knowledge/HTTP/clients/how-to-access-query-string-parameters/
        const queryObject = url.parse(req.url,true).query
        
        const requestedModelName = queryObject.model 
        const requestedFilename = queryObject.speech 
        const requestedGrammar = queryObject.grammar 
        const requestedId = queryObject.id 
      
        // set id to the is query string argument 
        // if id argument is not present in the quesy string, 
        // set the id with current timestamp in msecs.
        const currentTime = this.unixTimeMsecs()
        const id = requestedId ? requestedId : currentTime
    
        // log request  
        this.log(`request GET ${id} ${requestedFilename} ${requestedModelName? requestedModelName : ''} ${requestedGrammar? requestedGrammar : ''}`, null, currentTime)
    
        // validate query string arguments 
    
        // body must have attributes "speech" and "model"
        if ( !requestedFilename ) 
          return this.errorResponse(`id ${id} "speech" attribute not found in the body request`, 405, res)
    
        // if query argument "model" is specified in the client request,
        // it must be equal to the model name loaded by the server
        if ( requestedModelName && (requestedModelName !== this.modelName) ) 
          return this.errorResponse(`id ${id} Vosk model ${this.model} unknown`, 404, res)
    
        return this.responseTranscriptGet(id, requestedFilename, requestedGrammar, requestAcceptText, res)

      // all other HTTP methods 
      // return errorResponse(`method not allowed ${req.method}`, 405, res)

    } catch (error) {
      return res.status(500).send({
        result: error.message
      })
    }
  }

  public async post (req: Request, res: Response) {
    try {
      const requestAcceptText = (req.headers.accept === 'text/plain') ? true : false

      // get request headers attribute: "content-type" 
      const { 'content-type': contentType } = req.headers
      
      if (this.debug)
        this.log(`request POST content type ${contentType}`, 'DEBUG')

      // get request query string arguments
      const queryObject = url.parse(req.url,true).query

      const requestedModelName = queryObject.model 
      const requestedGrammar = queryObject.grammar 
      const requestedId = queryObject.id 
    
      // set id to the is query string argument 
      // if id argument is not present in the quesy string, 
      // set the id with current timestamp in msecs.
      const currentTime = this.unixTimeMsecs()
      const id = requestedId ? requestedId : currentTime

      // log POST request  
      this.log(`request POST ${id} ${'speechBuffer'} ${requestedModelName? requestedModelName: ''} ${requestedGrammar? requestedGrammar: ''}`, null, currentTime)

      // if query argument "model" is specified in the client request,
      // it must be equal to the model name loaded by the server
      if ( requestedModelName && (requestedModelName !== this.modelName) ) 
        return this.errorResponse(`id ${id} Vosk model ${this.model} unknown`, 404, res)

      // get request body binary data
      // containing speech WAV file 
      // TODO Validation of body  

      setTimer('attachedFile')

      //let body = []
      let speechAsBuffer = Buffer.alloc(0) 
      
      req.on('data', (chunk) => { 
        //body.push(chunk) 
        speechAsBuffer = Buffer.concat([speechAsBuffer, chunk])
      })

      // all the body is received 
      req.on('end', () => {
        
        //const speechAsBuffer = Buffer.concat(body)

        if (this.debug) 
          this.log(`HTTP POST attached file elapsed ${getTimer('attachedFile')}ms`, 'DEBUG')

        this.responseTranscriptPost(id, speechAsBuffer, requestedModelName, requestedGrammar, requestAcceptText, res)
      })
    }

    catch (error) {
      console.error(error)
    }
  }

  unixTimeMsecs() {
    return Math.floor(Date.now())
  }  


  log(text:string, type:null|string, time=this.unixTimeMsecs()) {
    //const time = unixTimeMsecs()
  
    if (type)
      console.log(`${time} ${type} ${text}`)
    else
      console.log(`${time} ${text}`)
  
    return time
  }

  errorResponse(message:string, statusCode:number, res:Response) {
    res.statusCode = statusCode
    res.end(`{"error":"${message}"}`)
    this.log(message, 'ERROR')
  }

  responseJson(id:any, latency:any, result:any, res: Response) {
    res.setHeader('Content-Type', 'application/json')

    return JSON.stringify({
      //... { request: JSON.stringify(queryObject) },
      ... { id },
      ... { latency },
      ... { result } 
      })
  }

  responseText(result:any, res:Response) {
    res.setHeader('Content-Type', 'text/plain')

    return result.text
  }

  successResponse(requestId:any, json:any, res:Response) {
    this.log(`response ${requestId} ${json}`, 'DEBUG')
    res.end(json)
  }


  async responseTranscriptGet(id:any, requestedFilename:any, requestedGrammar:any, requestAcceptText:any, res: Response) {
    try {
      const multiThreads = this.multiThreads
  
      if (this.debug) {
        // new thread started, increment global counter of active thread running
        this.activeRequests++
        this.log(`active requests ${this.activeRequests}`, 'DEBUG')
      }
  
      // speech recognition of an audio file
      setTimer('transcript')
      const grammar = requestedGrammar ? JSON.parse(requestedGrammar) : undefined
      const result = await transcriptFromFile(requestedFilename, this.model, {grammar, multiThreads})
      console.log(result)
      if (this.debug) {
        // thread finished, decrement global counter of active thread running
      this.activeRequests--
        this.log(`active requests ${this.activeRequests}`, 'DEBUG')
      }  
  
      const latency = getTimer('transcript')
  
      if (this.debug)
        this.log(`latency ${id} ${latency}ms`, 'DEBUG')
  
      const body = requestAcceptText ? 
        this.responseText(result, res) : 
        this.responseJson(id, latency, result, res)

      return this.successResponse(id, body, res)
  
    }
    catch (error) {
      return this.errorResponse(`id ${id} transcript function ${error}`, 415, res)
    }  
  }
  
  async responseTranscriptPost(id:any, buffer:any, requestedModelName:any, requestedGrammar:any, requestAcceptText:any, res:Response) {

    if (this.debug) 
      this.log(`Body Buffer length ${Buffer.byteLength(buffer)}`, 'DEBUG')
      
    try {
      const multiThreads = this.multiThreads
  
      if (this.debug) {
        // new thread started, increment global counter of active thread running
        this.activeRequests++
        this.log(`active requests ${this.activeRequests}`, 'DEBUG')
      }
  
      // speech recognition of an audio file
      setTimer('transcript')
      const grammar = requestedGrammar ? JSON.parse(requestedGrammar) : null
      const result = await transcriptFromBuffer(buffer, this.model, {grammar, multiThreads} )
  
      if (this.debug) {
        // thread finished, decrement global counter of active thread running
        this.activeRequests--
        this.log(`active requests ${this.activeRequests}`, 'DEBUG')
      }  
  
      const latency = getTimer('transcript')
  
      if (this.debug)
        this.log(`latency ${id} ${latency}ms`, 'DEBUG')
      
      const body = requestAcceptText ? 
        this.responseText(result, res) : 
        this.responseJson(id, latency, result, res)
  
      return this.successResponse(id, body, res)
  
    }  
    catch (error) {
      return this.errorResponse(`id ${id} transcript function ${error}`, 415, res)
    }  
  }
}
