import fs from 'fs'
import { MongoClient, Db, ObjectId, FilterQuery } from 'mongodb'
import { Event, EventList } from './routes/events'
import auth from './routes/auth'
import Database, { EventCollection } from './Database'

export default class Heatmap {

    private totalMembersInGroup = 0

    private async getAllEventsForGroup(groupId:ObjectId){
        var group = await Database.getAllGroups({_id:groupId})
        //get all users in group
        //could fail if "group" is empty?
        var userAccounts = await Database.getAllAccounts({_id:{$in:group[0].groupMembers}})

        this.totalMembersInGroup = userAccounts.length
        //promise of array of events
        var userEvents = await Database.getAllEvents({Account:{$in:userAccounts.map(account => {return account._id})}})//with specific user id
        //check each time frame in numberBusy
        return userEvents
        //if there is an event in that time frame, increment the value 
    }

    //places events into buckets
    private delegateBuckets(buckets: Array<number>, events:EventCollection[], date: Date){
        //for each date in events
        for(var event of events){
            //handle each time within each date
            let startTime = new Date(event.Date)
            let startTimeInMilliseconds = startTime.getTime()
            let durationInMilliseconds = event.Duration * 60 * 1000
            let endTime = new Date(startTimeInMilliseconds + durationInMilliseconds)

            let startIndex = this.getBucketIndex(startTime, date, 15)
            if(startIndex > 96) { continue }
            let endIndex = this.getBucketIndex(endTime, date, 15)
            if(endIndex < 0) { continue }

            startIndex = Math.max(startIndex, 0)
            endIndex = Math.min(endIndex, 96)

            for(let i = startIndex; i<endIndex; i++) {
                buckets[i]++
            }
        }

    }

    private getBucketIndex(at: Date, relativeTo: Date, bucketWidthInMinutes: number): number {
        let midnight = new Date(relativeTo.getFullYear(), relativeTo.getMonth(), relativeTo.getDate(), 0, 0, 0, 0)
        let midnightInMilliseconds = midnight.getTime()
        let atTimeMilliseconds = at.getTime()
        let bucketWidthInMilliseconds = bucketWidthInMinutes * 60 * 1000
        return Math.floor((atTimeMilliseconds - midnightInMilliseconds) / bucketWidthInMilliseconds)
    }

    //creates buckets of time based on fifteen minute increments
    private createBuckets(){
        let bucketList = new Array<number>(96)
        bucketList.fill(0)
        return bucketList
    }

    //creates the heatmap
    public async createHeatmap(groupId:ObjectId, date:Date){
        var events = await this.getAllEventsForGroup(groupId)
        let buckets = this.createBuckets()
        this.delegateBuckets(buckets, events, date)
        return {
            date: date,
            buckets: buckets,
            totalMembers: this.totalMembersInGroup
        }
    }
}

//create combined calendar with everyone's events