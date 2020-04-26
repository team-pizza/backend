import fs from 'fs'
import { MongoClient } from 'mongodb'

const mongoDBCredentials = JSON.parse(fs.readFileSync('mongoDBCredentials.json', 'utf-8'))

const mongoDBURL: string = mongoDBCredentials.url.replace('<username>', mongoDBCredentials.username).replace('<password>', mongoDBCredentials.password)

const client = new MongoClient(mongoDBURL)

class Database {
    constructor() {

    }
    testConnect() {

        client.connect(function (err, db) {
            console.log(mongoDBURL)
            if (err == null) {
                console.log("Connected to MongoDB successfully")
            } else {
                console.log(err)
            }
        })
    }
}

export default new Database()