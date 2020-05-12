import express from 'express'
import https from 'https'
import fs from 'fs'
import auth from './routes/auth'
import events from './routes/events'
import groups from './routes/groups'
import sendAccount from './routes/sendAccount'
import sendGroup from './routes/sendGroup'
import heatmap from './routes/heatmap'

const app = express()

app.get('/', (req, res, next) => {
    res.header('Content-Security-Policy', 'frame-src https://*.google.com')
    next()
})

app.use(express.json())

app.use('/auth', auth)
app.use('/events', events)
app.use('/groups', groups)
app.use('/sendGroup', sendGroup)
app.use('/sendAccount', sendAccount)
app.use('/heatmap', heatmap)

app.use(express.static('./src/public/'))

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app)
.listen(443, () => {
    console.log('Server listening on port 443!')
})
