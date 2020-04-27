import fs from 'fs'
import { MongoClient, Db, ObjectId } from 'mongodb'
import {Event, EventList } from './routes/events'

const mongoDBCredentials = JSON.parse(fs.readFileSync('mongoDBCredentials.json', 'utf-8'))

const mongoDBURL: string = mongoDBCredentials.url.replace('<username>', mongoDBCredentials.username).replace('<password>', mongoDBCredentials.password)

const client = new MongoClient(mongoDBURL)
function doWithDB(operation: (db: Db) => void, onError: ((err: any) => void) | undefined = undefined) {
    client.connect()
        .then(db => {
            operation(db.db(mongoDBCredentials.databaseName))
        })
        .catch(err => {
            if(onError) {
                onError(err)
            } else {
                console.log(err)
            }
        })
}

interface EventCollection {
    _id?: ObjectId,
    Date: Date,
    Time?: string,
    Duration: number,
    Repeat?: string,
    Private?: boolean,
    Account?: ObjectId
}

class Database {
    constructor() {

    }
    addEvents(element: Array<EventCollection>): Promise<any> {
        return new Promise((resolve, reject) => {
            doWithDB(async db => {
                db.collection('Event').insertMany(element)
                    .then(() => { resolve() })
                    .catch(err =>{reject(err)})
            }, err =>{
                reject(err)
            })
        })
    }
    getAllEvents(): Promise<Array<EventCollection>> {
        return new Promise((resolve, reject) => {
            doWithDB(async db => {
                const cursor = db.collection('Event').find({})
                let result: Array<EventCollection> = []
                while(await cursor.hasNext()) {
                    let element: EventCollection = await cursor.next()
                    result.push(element)
                }
                resolve(result)
            }, err =>{
                reject(err)
            })
        })
    }
}
export default new Database()