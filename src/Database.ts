import fs from 'fs'
import { MongoClient, Db, ObjectId, FilterQuery, UpdateQuery, MatchKeysAndValues } from 'mongodb'
import { Event, EventList } from './routes/events'

const mongoDBCredentials = JSON.parse(fs.readFileSync('mongoDBCredentials.json', 'utf-8'))

const mongoDBURL: string = mongoDBCredentials.url.replace('<username>', mongoDBCredentials.username).replace('<password>', mongoDBCredentials.password)

const client = new MongoClient(mongoDBURL)

export interface EventCollection {
    _id?: ObjectId,
    Date: Date,
    Time?: string,
    Duration: number,
    Repeat?: string,
    Private?: boolean,
    Account?: ObjectId
}

export interface AccountCollection {
    _id?: ObjectId,
    userID: string,
    email: string,
    Groups: Array<ObjectId>,
    Events?: Array<ObjectId>
}

export interface GroupCollection {
    _id?: ObjectId,
    groupName: string,
    groupOwner: ObjectId,
    groupMembers: Array<ObjectId>
}

class Database {
    constructor() {

    }
    private doWithDB(operation: (db: Db) => void, onError: ((err: any) => void) | undefined = undefined) {
        client.connect()
            .then(db => {
                operation(db.db(mongoDBCredentials.databaseName))
            })
            .catch(err => {
                if (onError) {
                    onError(err)
                } else {
                    console.log(err)
                }
            })
    }
    private getAll<T>(collectionName: string, resolve: (value?: Array<T> | PromiseLike<Array<T>> | undefined) => void, reject: (reason?: any) => void, filterQuery: FilterQuery<any> | undefined = undefined) {
        this.doWithDB(async db => {
            try {
                const cursor = db.collection(collectionName).find(filterQuery)
                let result: Array<T> = []
                while (await cursor.hasNext()) {
                    let element: T = await cursor.next()
                    result.push(element)
                }
                resolve(result)
            } catch (err) {
                reject(err)
            }
        }, err => {
            reject(err)
        })
    }
    private addAll<T>(collectionName: string, elements: Array<T>, resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void) {
        this.doWithDB(async db => {
            db.collection(collectionName).insertMany(elements)
                .then(() => { resolve() })
                .catch(err => { reject(err) })
        }, err => {
            reject(err)
        })
    }
    private destroyAll<T>(collectionName: string, resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void, filterQuery: FilterQuery<any> = {}) {
        this.doWithDB(async db => {
            db.collection(collectionName).deleteMany(filterQuery)
                .then(() => { resolve() })
                .catch((err) => { reject(err) })
        }, err => {
            reject(err)
        })
    }
    private destroyOne<T>(collectionName: string, resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void, filterQuery: FilterQuery<any> = {}) {
        this.doWithDB(async db => {
            db.collection(collectionName).deleteOne(filterQuery)
                .then(() => { resolve() })
                .catch((err) => { reject(err) })
        }, err => {
            reject(err)
        })
    }
    private updateOne<T>(collectionName: string, resolve: (value?: void | PromiseLike<void> | undefined) => void, reject: (reason?: any) => void, filterQuery: FilterQuery<any>, updateQuery: MatchKeysAndValues<any>) {
        this.doWithDB(async db => {
            db.collection(collectionName).updateOne(filterQuery, {
                $set: updateQuery
            })
                .then(() => resolve())
                .catch((err) => reject(err))
        }, err => {
            reject(err)
        })
    }

    addEvents(elements: Array<EventCollection>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.addAll('Event', elements, resolve, reject)
        })
    }
    addAccounts(elements: Array<AccountCollection>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.addAll('Account', elements, resolve, reject)
        })
    }
    addGroups(elements: Array<GroupCollection>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.addAll('Group', elements, resolve, reject)
        })
    }

    getAllEvents(filterQuery: FilterQuery<any> | undefined = undefined): Promise<Array<EventCollection>> {
        return new Promise((resolve, reject) => {
            this.getAll('Event', resolve, reject, filterQuery)
        })
    }
    getAllAccounts(filterQuery: FilterQuery<any> | undefined = undefined): Promise<Array<AccountCollection>> {
        return new Promise((resolve, reject) => {
            this.getAll('Account', resolve, reject, filterQuery)
        })
    }
    getAllGroups(filterQuery: FilterQuery<any> | undefined = undefined): Promise<Array<GroupCollection>> {
        return new Promise((resolve, reject) => {
            this.getAll('Group', resolve, reject, filterQuery)
        })
    }

    destroyAllEvents(filterQuery: FilterQuery<any> = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.destroyAll('Event', resolve, reject, filterQuery)
        })
    }
    destroyAllAccounts(filterQuery: FilterQuery<any> = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.destroyAll('Account', resolve, reject, filterQuery)
        })
    }
    destroyAllGroups(filterQuery: FilterQuery<any> = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.destroyAll('Group', resolve, reject, filterQuery)
        })
    }

    updateEvent(filterQuery: FilterQuery<any>, updateQuery: MatchKeysAndValues<any>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.updateOne('Event', resolve, reject, filterQuery, updateQuery)
        })
    }
    updateAccount(filterQuery: FilterQuery<any>, updateQuery: MatchKeysAndValues<any>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.updateOne('Account', resolve, reject, filterQuery, updateQuery)
        })
    }
    updateGroup(filterQuery: FilterQuery<any>, updateQuery: MatchKeysAndValues<any>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.updateOne('Group', resolve, reject, filterQuery, updateQuery)
        })
    }

    async replaceEventsForUserInSpan(userID: string, eventList: EventList): Promise<boolean> {
        try {
            let accountId = (await this.getAllAccounts({ userID: userID }))[0]._id as ObjectId

            // TODO: Figure out how to conditionally drop events based on if they overlap with the update span
            await this.destroyAllEvents({ Account: accountId })

            await this.addEvents(eventList.events.map(event => {
                return {
                    Date: event.start,
                    Duration: event.durationInMinutes,
                    Account: accountId
                }
            }))
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

}
export default new Database()