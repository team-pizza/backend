import fs from 'fs'
import { MongoClient, Db, ObjectId, FilterQuery } from 'mongodb'
import { Event, EventList } from './routes/events'
import auth from './routes/auth'
import Database, { EventCollection } from './Database'



class Heatmap {

    private numberBusy: any = {} //numberBusy[bucketNumber] = number
    private percentBusy: any = {} //percentBusy[bucketNumber] = percentage
    private bucketsForDate: any = {}//bucketsForDate[day] = bucketList

    constructor(){
        //fills the numberBusy with all 0s
        for(var i=0; i<95;i++){
            this.numberBusy[i] = 0
        }  
    }

    //determines if there is an event within a specific time frame
    private async countCalendarEvents(groupId:ObjectId){
        var group = await Database.getAllGroups({_id:groupId})
        //get all users in group
        //could fail if "group" is empty?
        var userAccounts = await Database.getAllAccounts({_id:{$in:group[0].groupMembers}})
        //promise of array of events
        var userEvents = await Database.getAllEvents({Account:{$in:userAccounts.map(account => {return account._id})}})//with specific user id
        //check each time frame in numberBusy
       
        //if there is an event in that time frame, increment the value 
    }

    //places events into buckets
    private delegateBuckets(events:EventCollection[]){
        //for each date in events
        for(var event of events){
            //handle each time within each date
            let eventBucketList = this.createBuckets(event)
            this.bucketsForDate[event.Date.getDate()] = eventBucketList
        }

    }

    //calculates how many people are busy on a specific day
    private calculateBusy(specifiedDate:Date){
        let b = this.bucketsForDate[specifiedDate.getDate()]

        for(var i = 0; i < b.length(); i++){
            this.numberBusy[b[i]]++
        }

    }

    //creates buckets of time based on fifteen minute increments
    private createBuckets(event:EventCollection){
        let startTime = event.Date 
        //array of buckets
        let bucketList = new Array<number>(96)
        
        //find the start time
        let startTimeInMilliseconds = startTime.getTime() //milliseconds since Jan 1, 1975

        //find the end time
        let durationInMilliseconds = event.Duration * 60000
        let endTimeinMilliseconds = startTimeInMilliseconds + durationInMilliseconds

        let endTime = new Date(endTimeinMilliseconds)
       
        let startBucket = ((startTime.getHours()*4) + Math.floor(startTime.getMinutes()/15))
        let endBucket = ((endTime.getHours()*4) + Math.floor(endTime.getMinutes()/15))

        for(var i = startBucket; i < endBucket; i++){
            bucketList.push(i)
        }

        return bucketList

    }

    //calculates the number in the array over 100 as a 2-digit decimal
    private calculatePercentages(){
        for(var i = 0; i< this.numberBusy.length; i++){
            this.percentBusy[i] = this.numberBusy[i]/100
        }
        //percentBusy will be used to determine colors of blocks on the UI
    }
}

//create combined calendar with everyone's events