import express, { response } from 'express'
import database, { GroupCollection, AccountCollection } from '../Database'
import { ObjectId } from 'mongodb'

let router = express.Router()

interface GroupObject {
    groupName: string,
    groupOwner: string,
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

router.post('/sendGroup/', async (req, res, next) => {
    let sessionToken = req.header('sessionToken')
    // TODO: Use sessionToken to verify identity of who sent this
    let userID = "72539478479825" // Once authentication is done, replace with function for finding real userID

    let groupObject: GroupObject = req.body

    let success = false
    try {
        let owner = (await database.getAllAccounts({userID: userID}))[0]
        groupObject.groupOwner = owner.email
        let group = await getGroupByNameFromList(groupObject.groupName, owner.Groups)
        groupObject.groupName = group.groupName
        let groupMembers = group.groupMembers
        let emails = Array<string>()
        groupMembers.forEach(async member => {
            let groupMember = (await database.getAllAccounts({userID: userID}))[0]
            emails.push(groupMember.email)
        })
        groupObject.userEmails = emails
        success = true
    } catch (error) {
        console.log(error)
    }

    res.json({
        success: success
    })
})

export default router
