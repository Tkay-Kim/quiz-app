import express from 'express'
import cors from 'cors'
import path from 'path'
import { router } from './routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(errorHandler)

export default app
