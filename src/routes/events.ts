import express from 'express'

let router = express.Router()

router.post('/upload', async (req, res, next) => {
    console.log(req.header('sessionToken'))
    console.log(req.body)
    res.sendStatus(200)
})

export default router