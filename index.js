////////// Dashboard
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')
const connectionString = "postgres://callie:callie@localhost:5432/practicedb"

const client = new Client({connectionString})
client.connect().then(response => console.log("Connected"))

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
      const values = [span.spanId, span.traceId, span.parentSpanId, span.startTimeUnixNano, span.endTimeUnixNano, JSON.stringify(span.attributes)]
      client.query(text, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          //console.log(res.rows)
        }
      })
    });
  })
  res.send("ok")
})

app.post('/v1/metrics', (req, res) => {
  //console.log(JSON.stringify(req.body, null, 2))
  const allMetricsObject = req.body.instrumentationLibraryMetrics[0].metrics[0]
  console.log("FEAR ME I AM THE METRICS OBJECT", allMetricsObject)

  res.type('json')
})

app.listen(port, () => console.log("Listening on the port"))
