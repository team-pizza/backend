import express, { response } from 'express'
import database, { GroupCollection } from '../Database'
import { ObjectId } from 'mongodb'
import { queryKey } from './auth'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import { url } from '../main'

let transporter: Mail | null = null
async function setupEmail() {
    // TODO: change this to a non-test SMTP server when production ready
    let testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })
}
setupEmail()
    .then(() => {
        console.log('Ready to send emails')
    })
    .catch(err => {
        console.log('Failed to setup email')
        console.log(err)
    })

let router = express.Router()

interface GroupInviteRequest {
    groupName: string,
    userEmails: Array<string>
}

async function getGroupByNameFromList(groupName: string, groups: Array<ObjectId>): Promise<GroupCollection> {
    let chosenOne: GroupCollection | null = null
    let groupPromises = groups.map<Promise<GroupCollection>>(async (groupID: ObjectId) => {
        return (await database.getAllGroups({ _id: groupID }))[0]
    })
    let groupObjects = await groupPromises.reduce<Promise<Array<GroupCollection>>>((promiseChain, currentPromise): Promise<Array<GroupCollection>> => {
        return new Promise((resolve, reject) => {
            promiseChain.then(accumulator => {
                currentPromise.then(currentGroup => {
                    resolve([...accumulator, currentGroup])
                }).catch(err => reject(err))
            }).catch(err => reject(err))
        })
    }, Promise.resolve([]))
    groupObjects.forEach(group => {
        if (group.groupName == groupName) {
            chosenOne = group
        }
    })
    if (chosenOne == null) {
        throw new Error('The requested group does not exist')
    }
    return chosenOne
}

async function sendInviteEmail(emailAddress: string, accountId: ObjectId, groupName: string, groudId: ObjectId) {
    let link = `https://${url}:443/groups/join/${groudId.toHexString()}/${accountId.toHexString()}`
    try {
        let info = await transporter?.sendMail({
            from: 'Better Access Stout <bas@basproject.com>',
            to: emailAddress,
            subject: `You have been invited to join "${groupName}"`,
            text: `To accept your invite to join "${groupName}", please follow this link: ${link}`,
            html: `To accept your invite to join "${groupName}", please follow this link: <a href="${link}">${link}</a>`
        })
        console.log(`Email sent. View email here: ${nodemailer.getTestMessageUrl(info)}`)
    } catch (error) {
        console.log(error)
    }
}

router.post('/invite/', async (req, res, next) => {
    let sessionToken = req.header('sessionToken') || 'undefined'
    let userID = queryKey(sessionToken)

    let groupInviteRequest: GroupInviteRequest = req.body

    let success = false
    try {
        if (userID) {
            let groupOwner = (await database.getAllAccounts({ userID: userID }))[0]
            let group = await getGroupByNameFromList(groupInviteRequest.groupName, groupOwner.Groups)
            let groupMembers = group.groupMembers
            groupInviteRequest.userEmails.forEach(async email => {
                let possibleAccounts = await database.getAllAccounts({ email: email })
                if (possibleAccounts.length == 1) {
                    let invitedUser = possibleAccounts[0]
                    await sendInviteEmail(invitedUser.email, invitedUser._id as ObjectId, group.groupName, group._id as ObjectId)
                } else if (possibleAccounts.length == 0) {
                    console.log(`There is not an account associated with "${email}", skipping`)
                }
            })
            success = true
        }
    } catch (error) {
        console.log(error)
    }

    res.json({
        success: success
    })
})

router.get('/join/:groupIdHex/:accountIdHex', async (req, res, next) => {
    let success = false
    let groupName: string | null = null
    try {
        let groupId = new ObjectId(req.params.groupIdHex)
        let accountId = new ObjectId(req.params.accountIdHex)

        let account = (await database.getAllAccounts({_id: accountId}))[0]
        let group = (await database.getAllGroups({_id: groupId}))[0]

        let groupMembers = group.groupMembers

        groupMembers.push(account._id as ObjectId)

        let distinctMembers = [...(new Set(groupMembers))]

        if(groupMembers.length != distinctMembers.length) {
            await database.updateGroup({_id: group._id}, { groupMembers: distinctMembers })
        } else {
            res.send(`<html><body><p>Invite already accepted.</p></body></html>`)
            return
        }

        groupName = group.groupName
        success = true
    } catch (error) {
        console.log(error)
    }

    if(success) {
        res.send(`<html><body><h1>You have successfully joined "${groupName || 'null'}"</h1><br /><p>Please open the app on your Android device to continue.</p></body></html>`)
    } else {
        res.send(`<html><body><p>Error. Something went wrong. Please ask your group owner to resend your invite.</p></body></html>`)
    }

})

export default router