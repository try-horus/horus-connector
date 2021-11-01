////////// Dashboard

require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')

const client = new Client('postgresql://localhost:5432/practicedb?user=callie&password=callie')
client.connect().then(response => console.log(response))

app.use(express.json())
app.use(cors())


const port = 3002

app.get("/", (req, res) => {
  res.json("Hello World")
})

app.post('/v1/traces', (req, res) => {
  const allSpansArray = req.body.resourceSpans[0]["instrumentationLibrarySpans"]
  allSpansArray.forEach(element => {
    const multiLibrarySpans = element.spans

    multiLibrarySpans.forEach(span => {
      console.log(span.traceId)
      console.log(span.spanId)
      console.log(span.parentSpanId)
      console.log(span.startTimeUnixNano)
      console.log(span.endTimeUnixNano)
      // We don't know what are the span
      // tags and the resource tags
      console.log("-------------------")
    })
  });
  res.send("ok")
})

app.post('/v1/metrics', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2))
  console.log("NEW REQUEST!!!!")
  res.type('json')
})

app.listen(port, () => console.log("Listening on the port"))
