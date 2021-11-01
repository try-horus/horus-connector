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
    const text = 'INSERT into spans(span_id, trace_id, parent_span_id, start_time, end_time, span_tags) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
    multiLibrarySpans.forEach(span => {
      const values = [span.traceId, span.spanId, span.parentSpanId, span.startTimeUnixNano, span.endTimeUnixNano, span.attributes]
      client.query(text, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows)
        }
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
