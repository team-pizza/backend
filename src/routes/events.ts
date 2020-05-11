import express from 'express'
import database from '../Database'
import { queryKey } from './auth'

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
    let sessionToken = req.header('sessionToken') || 'undefined'
    let userID = queryKey(sessionToken)

    let eventList: EventList = req.body

    let result = false

    try {
        if (userID) {
            result = await database.replaceEventsForUserInSpan(userID, eventList)
        }
    } catch (error) {
        console.log(error)
    }


    res.json({
        success: result
    })
})

export { router as events, Event, EventList }