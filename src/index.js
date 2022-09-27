'use strict'

import express from 'express'
import http from 'http'
import cors from 'cors'
import compression from 'compression'
import apicache from 'apicache'
import redis from 'redis'
import robots from 'express-robots-txt'

import reachableFrom from './reachableFrom.js'
import { stationsByQuery, stationById, stationList } from './stations.js'

const port = process.env.PORT | 3000
if (!port) throw new Error('please provide a PORT environment variable')

const api = express()
const server = http.createServer(api)
api.use(cors())

api.use(compression())
api.use(robots({ UserAgent: '*', Disallow: '/' }))

api.get('/health', (req, res) => res.end())

// enable caching
// todo: use a global cache (redis?) here
const cache = apicache.options({
	appendKey: () => 'v6',
	redisClient: process.env.REDIS_URI
		? redis.createClient(process.env.REDIS_URI)
		: undefined,
	statusCodes: {
		include: [200],
	},
}).middleware

api.get('/', cache('24 hour'), stationList)
api.get('/stations', cache('24 hours'), stationsByQuery)
api.get('/stations/:id', cache('24 hours'), stationById)
api.get('/:id', cache('24 hours'), reachableFrom)

api.disable('x-powered-by')

server.listen(port, (error) => {
	if (error) {
		console.error(error)
		process.exit(1)
	}
	console.log(`Listening on ${port}.`)
})
