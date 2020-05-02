import express from 'express'
import database from '../Database'

const cred = require('../../credentials.json')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(cred.web.client_id, cred.web.client_secret)
//array/hash map to store key (let x = new whatever-youre-storing-it-in())
let sessionTokenHash: any = {}


async function verify(token: string) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: cred.web.client_id
    })
    const payload = ticket.getPayload()
    const userid = payload['sub']
    return {
        userId: payload.sub,
        email: payload.email
    }
}

let router = express.Router()


interface GoogleSignInRequest {
    googleIdentificationToken: string
}

router.post('/', async (req, res, next) => {
    let userExists = false
    let request: GoogleSignInRequest = req.body
    let accountDetails = await verify(request.googleIdentificationToken)
    //get accounts from database
    let successFlag = false
    try {
        let accounts = await database.getAllAccounts()
        //checks Google user id to see if it already exists
        accounts.forEach(account => {
            if (account.userID == accountDetails.userId) {
                //account has pre-existing userId
                //user already exists
                userExists = true
                //update email?
            }
        })

        if (!userExists) {
            //account does not exist
            //create a new account
            await database.addAccounts([{
                userID: accountDetails.userId,
                email: accountDetails.email,
                Groups: []
            }])
        }
    let successFlag = true
    } catch (error) {
        console.log(error)
    }

    //send session key back to user
    let key = generateKey(accountDetails.userId)

    res.json({
        success: successFlag,
        sessionKey: key
    })
    
})

//generate session key
function generateKey(accountID: string){
    //generate random string of characters
    let sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    //store session key in RAM
    sessionTokenHash[sessionKey] = accountID

    //return key generated
    return sessionKey
}

//function called from outside file to find pre-existing key
export function queryKey(token: string){
    //query value
    //if value does not exist, return null
    return sessionTokenHash[token] || null
}




export default router