import express from 'express'
import { helper } from './util.js'
const app = express()
app.get('/api/items', (req, res) => res.json(helper()))
app.post('/api/items', (req, res) => res.status(201).end())
app.get('/api/items/:id', (req, res) => res.json({}))
app.listen(3000)
