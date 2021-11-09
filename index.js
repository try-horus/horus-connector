////////// Dashboard
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')
//const connectionString = "postgres://callie:callie@localhost:5432/practicedb"
const connectionString = "postgres://juan:juan@localhost:5432/horus"


const client = new Client({connectionString})
client.connect()
  .then(() => console.log("Connected"))
  .catch(error => console.log(error))

app.use(express.json())
app.use(cors())

const port = 3002

app.get("/", (req, res) => {
  res.json("Hello World")
})

/*
const addNewTraceToDatabase = async (traceId) => {
  const createTraceText = 'INSERT INTO traces(trace_id) VALUES($1) RETURNING *'

  try {
    const res = await client.query(createTraceText, [traceId])//, async (err, res) => {
    //   if (err) {
    //     console.log(err.stack)
    //   } else {
    //     console.log(res.rows)
    //   }
    //})
    //console.log(res.rows)
    console.log("this should get printed first")
  } catch(e) {
    console.log(e)
  }
}*/

app.post('/v1/traces', async (req, res) => {
  const allSpansArray = req.body.resourceSpans[0]["instrumentationLibrarySpans"]
  const traceId = allSpansArray[0]["spans"][0]["traceId"]

  const checkIfTraceExists = 'SELECT * FROM traces WHERE trace_id=$1'
  const createSpanText = 'INSERT INTO spans(span_id, trace_id, parent_span_id, span_name, start_time, end_time, span_latency, instrumentation_library, span_attributes) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'
  const createTraceText = 'INSERT INTO traces(trace_id, root_span_id, start_time, end_time, trace_latency) VALUES($1, $2, $3, $4, $5) RETURNING *'
  //const updateTraceText = 'UPDATE traces SET root_span_id=$1, start_time=$2, end_time=$3 WHERE trace_id=$4'

  // try {
  //   const res = await client.query(checkIfTraceExists, [traceId])//, async (err, res) => {
  //   //   if (err) {
  //   //     console.log(err.stack)
  //   //   } else {
  //   //     console.log(res.rows)
  //   //     if (res.rows.length === 0) {
  //   //       await addNewTraceToDatabase(traceId)
  //   //     }
  //   //   }
  //   // })
  //   console.log(res.rows)
  //   if (res.rows.length === 0) {
  //     console.log(traceId)
  //     await addNewTraceToDatabase(traceId)
  //   }
  // } catch(e) {
  //   console.log(e)
  // }
  // console.log("this should get printed second")
  /*
    I have to get the data from which library generated the span
    If a span is the root, update the traces table with info
    from this span
  */

 
  allSpansArray.forEach(element => {
    const spansFromOneLibrary = element.spans
    const instrumentationLibrary = element["instrumentationLibrary"]["name"]
   
    spansFromOneLibrary.forEach(span => {
      const spanLatency = span.endTimeUnixNano - span.startTimeUnixNano
      const values = [span.spanId, span.traceId, span.parentSpanId, span.name, span.startTimeUnixNano, span.endTimeUnixNano, spanLatency, instrumentationLibrary, JSON.stringify(span.attributes)]
      client.query(createSpanText, values, (err, res) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(res.rows[0])
        }
      })

      if (span.parentSpanId === undefined) {
        const traceLatency = spanLatency

        const values = [traceId, span.spanId, span.startTimeUnixNano, span.endTimeUnixNano, traceLatency]
        client.query(createTraceText, values, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        })
      }
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
