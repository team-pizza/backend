import express from 'express'

let router = express.Router()

interface Event {
    start: Date
    durationInMinutes: Number
}
interface EventList {
    events: Array<Event>
    start: Date
    spanInMinutes: Number
}

router.post('/upload', async (req, res, next) => {
    let sessionToken = req.header('sessionToken')
    // TODO: Use sessionToken to verify identity of who sent this

    let eventList: EventList = req.body

    // TODO: Add events into database

    res.json({
        success: true
    })
})

export default router