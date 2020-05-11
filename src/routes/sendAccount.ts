import express, { response } from 'express'
import database, { AccountCollection } from '../Database'
import { ObjectId } from 'mongodb'

let router = express.Router()

interface AccountObject {
    userID: string,
    userEmail: string,
    groups: Array<string>
    events: Array<string>
}

async function getAccountByNameFromList(userID: string, accounts: Array<ObjectId>): Promise<AccountCollection> {
    accounts.forEach(async accountID => {
        let account = (await database.getAllAccounts({_id: accountID}))[0]
        if(account.userID == userID) {
            return account
        }
    })
    throw new Error('The requested account does not exist')
}

router.post('/sendAccount/', async (req, res, next) => {
    let sessionToken = req.header('sessionToken')
    // TODO: Use sessionToken to verify identity of who sent this
    let userID = "72539478479825" // Once authentication is done, replace with function for finding real userID

    let AccountObject: AccountObject = req.body

    let success = false
    try {
        let account = (await database.getAllAccounts({userID: userID}))[0]
        let userEmail = account.email
        let groups = account.Groups
        let events = account.Events
        success = true
    } catch (error) {
        console.log(error)
    }

    res.json({
        success: success
    })
})

export default router
