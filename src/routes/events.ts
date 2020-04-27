import express from 'express'
import database from '../Database'

let router = express.Router()

interface Event {
    start: Date
    durationInMinutes: number
}
interface EventList {
    events: Array<Event>
    start: Date
    spanInMinutes: number
}

router.post('/upload', async (req, res, next) => {
    let sessionToken = req.header('sessionToken')
    // TODO: Use sessionToken to verify identity of who sent this

    let eventList: EventList = req.body

    try {
        await database.addEvents(eventList.events.map(event => {
            return {
                Date: event.start,
                Duration: event.durationInMinutes
            }
        }))

        console.log('All database events:')
        console.log(await database.getAllEvents())
    } catch (error) {
        console.log(error)
    }


    res.json({
        success: true
    })
})

export { router as events, Event, EventList }