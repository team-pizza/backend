import express, { response } from 'express'
import database, { GroupCollection } from '../Database'
import { ObjectId } from 'mongodb'

let router = express.Router()

interface GroupInviteRequest {
    groupName: string,
    userEmails: Array<string>
}

async function getGroupByNameFromList(groupName: string, groups: Array<ObjectId>): Promise<GroupCollection> {
    groups.forEach(async groupID => {
        let group = (await database.getAllGroups({_id: groupID}))[0]
        if(group.groupName == groupName) {
            return group
        }
    })
    throw new Error('The requested group does not exist')
}

router.post('/invite/', async (req, res, next) => {
    let sessionToken = req.header('sessionToken')
    // TODO: Use sessionToken to verify identity of who sent this
    let userID = "72539478479825" // Once authentication is done, replace with function for finding real userID

    let groupInviteRequest: GroupInviteRequest = req.body

    let success = false
    try {
        let groupOwner = (await database.getAllAccounts({userID: userID}))[0]
        let group = await getGroupByNameFromList(groupInviteRequest.groupName, groupOwner.Groups)
        let groupMembers = group.groupMembers
        groupInviteRequest.userEmails.forEach(async email => {
            let possibleAccounts = await database.getAllAccounts({email: email})
            if(possibleAccounts.length == 1) {
                let invitedUser = possibleAccounts[0]
                groupMembers.push(invitedUser._id as ObjectId)
            } else if(possibleAccounts.length == 0) {
                console.log(`There is not an account associated with "${email}", skipping`)
            }
        })
        let distinctGroupMembers = [...new Set(groupMembers)]
        if(distinctGroupMembers != groupMembers) {
            await database.updateGroup({ _id: group._id }, {groupMembers: distinctGroupMembers})
        }
        success = true
    } catch (error) {
        console.log(error)
    }

    res.json({
        success: success
    })
})

export default router