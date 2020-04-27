import express from 'express'

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
    return userid
}

let router = express.Router()


router.post('/', async (req, res, next) => {
    console.log(req.body)
    console.log(await verify(req.body.token))
})

export default router