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
  const text = 'INSERT into spans(span_id, trace_id, parent_span_id, start_time, end_time, span_tags) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
  
   allSpansArray.forEach(element => {
    const multiLibrarySpans = element.spans
    multiLibrarySpans.forEach(span => {
      const values = [span.spanId, span.traceId, span.parentSpanId, span.startTimeUnixNano, span.endTimeUnixNano, JSON.stringify(span.attributes)]
      client.query(text, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })
    });
  })
  res.send("ok")
})

app.post('/v1/metrics', (req, res) => {
  if (!req.body.resourceMetrics[0]) return;
  
  console.log(JSON.stringify(req.body, null, 2))
  
  const allMetricsArray = req.body.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics
  let tableName;

  allMetricsArray.forEach(metric => {

    if (metric.name === "request_count") {
      tableName = 'rps'
    } else if (metric.name === "error_count") {
      tableName = 'eps'
    }

    const dataPoints = metric.doubleSum.dataPoints[0]
    const text = `INSERT INTO ${tableName}(name, description, time, value, labels) VALUES($1, $2, to_timestamp($3), $4, $5) RETURNING *`
    const values = [metric.name, metric.description, Date.now()/1000, dataPoints.value, JSON.stringify(dataPoints.labels)]

    client.query(text, values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
    })
  })

  res.type('json')
})

app.listen(port, () => console.log("Listening on the port 3002"))
