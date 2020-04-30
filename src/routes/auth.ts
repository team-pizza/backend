import express from 'express'
import database from '../Database'

const cred = require('../../credentials.json')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(cred.web.client_id, cred.web.client_secret)
//array/hash map to store key (let x = new whatever-youre-storing-it-in())
export interface IHash {
    sKey: string
    uID: string
    [key: string] : any;
} 




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
    } catch (error) {
        console.log(error)
    }

    //send session key back to user
    generateKey(accountDetails.userId)

    console.log(await verify(req.body.token))

    
})

//generate session key
function generateKey(accountID: string){
    //generate random string of characters
    let sessionKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    //store session key in RAM
    let myhash: IHash = {
        sKey: sessionKey,
        uID: accountID
    };

    //return key generated
    return sessionKey
}

//function called from outside file to find pre-existing key
function queryKey(token: string){

    //returns reference to account or null

}




export default router