import fs from 'fs'
import { MongoClient, Db, ObjectId, FilterQuery } from 'mongodb'
import { Event, EventList } from './routes/events'
import auth from './routes/auth'

//get calendar events

//create combined calendar with everyone's events