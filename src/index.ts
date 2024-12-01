import {setFailed} from '@actions/core'
import run from './main'

run().catch((error)=>{
  let message = '[Comment Progress] An error occurred.'
  if (error instanceof Error) message = error.message
  setFailed(message);
})
