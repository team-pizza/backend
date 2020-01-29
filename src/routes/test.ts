import express from 'express'

const app = express.Router()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

export default app