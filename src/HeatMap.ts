import fs from 'fs'
import { MongoClient, Db, ObjectId, FilterQuery } from 'mongodb'
import { Event, EventList } from './routes/events'
import auth from './routes/auth'
import Database from './Database'

let numberBusy: any = {}
let percentBusy: any = {}
let time = 10

class Heatmap {
    constructor(){
        //fills the numberBusy with all 0s
        for(var i = 0; i <= time; i++){
            numberBusy[i] = 0
        }
        
    }

    //determines if there is an event within a specific time frame
    private countCalendarEvents(){
        Database.getAllEvents
        //check each time frame in numberBusy
        for(var i = 0; i < numberBusy.length; i++){
            //if there is an event in that time frame, increment the value 
        }
        
    }

    //calculates the number in the array over 100 as a 2-digit decimal
    private calculatePercentages(){
        for(var i = 0; i< numberBusy.length; i++){
            percentBusy[i] = numberBusy[i]/100
        }
        //percentBusy will be used to determine colors of blocks on the UI
    }
}

//create combined calendar with everyone's events