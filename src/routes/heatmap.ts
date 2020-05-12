import express from 'express'
import database from '../Database'
import { queryKey } from './auth'
import Heatmap from '../HeatMap'
import { ObjectId } from 'mongodb'

let router = express.Router()

interface HeatmapRequest {
    groupIdHex: string,
    date: string
}

router.post('/', async (req, res, next) => {
    let sessionToken = req.header('sessionToken') || 'undefined'
    let userID = queryKey(sessionToken)

    let heatmapRequest: HeatmapRequest = req.body

    let success = false
    try {
        let groudId = new ObjectId(heatmapRequest.groupIdHex)
        let heatmap = new Heatmap()
        heatmap.createHeatmap(groudId, new Date(heatmapRequest.date))

    } catch (error) {
        console.log(error)
    }


    res.json({
        success: success
    })
})

export default router