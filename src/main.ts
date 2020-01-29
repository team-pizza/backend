import express from 'express'
import path from 'path'
import test from './routes/test'

const app = express()

// Serve static files in the public folder
app.use('/', express.static(path.join(__dirname, '../src/public')))
// Serve client end typescript files
app.use('/', express.static(path.join(__dirname, './public')))


// Test router. All requests to http://localhost:8080/test will be redirected to this route
app.use('/test', test)

let port = 8080
app.listen(port, () => {
    console.log(`Webserver is listening on port ${port}`)
})

