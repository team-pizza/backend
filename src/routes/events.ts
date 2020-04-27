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
    let userID = "72539478479825" // Once authentication is done, replace with function for finding real userID

    let eventList: EventList = req.body

    let result = false

    try {
        result = await database.replaceEventsForUserInSpan(userID, eventList)

        // For debugging purposes, remove before production
        console.log(await database.getAllAccounts())
        console.log(await database.getAllEvents())
        console.log(await database.getAllGroups())
    } catch (error) {
        console.log(error)
    }


    res.json({
        success: result
    })
})

export { router as events, Event, EventList }