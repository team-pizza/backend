import express from 'express'
import database from '../Database'

const cred = require('../../credentials.json')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(cred.web.client_id, cred.web.client_secret)

async function verify(token: String) {
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
    let request: GoogleSignInRequest = req.body
    let accountDetails = await verify(request.googleIdentificationToken)
    // database.getAllAccounts(...)
    console.log(await verify(req.body.token))
})

export default router