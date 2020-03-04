import express from 'express'
import auth from './routes/auth'

const app = express()

app.get('/', (req, res, next) => {
    res.header('Content-Security-Policy', 'frame-src https://*.google.com')
    next()
})

app.use(express.json())

app.use('/auth', auth)

app.use(express.static('./src/public/'))

app.listen(3000, () => {
    console.log('Server is running')
})