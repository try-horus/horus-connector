////////// Dashboard
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')
const connectionString = "postgres://callie:callie@localhost:5432/horus"


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

app.post('/v1/traces', async (req, res) => {
  console.log("Trace received");
  const allSpansArray = req.body.resourceSpans[0]["instrumentationLibrarySpans"]

  const createSpanText = 'INSERT INTO spans(span_id, span_name, trace_id, parent_span_id, start_time, end_time, span_latency, instrumentation_library, span_attributes, status_code) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *'
  const createTraceText = 'INSERT INTO traces(trace_id, trace_latency, root_span_http_method, root_span_endpoint, root_span_id, trace_start_time) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'

  allSpansArray.forEach(element => {
    const spansFromOneLibrary = element.spans
    const instrumentationLibrary = element["instrumentationLibrary"]["name"]

    spansFromOneLibrary.forEach(span => {
      const nanoToMiliSeconds = 1000000;
      const spanLatency = (span.endTimeUnixNano - span.startTimeUnixNano)/nanoToMiliSeconds;
      const startTimestamp = new Date(span.startTimeUnixNano/nanoToMiliSeconds);
      const endTimestamp = new Date(span.endTimeUnixNano/nanoToMiliSeconds);

      // Retrieve attribute values for span and trace SQL insertion
      let httpMethod, endpoint, statusCode;

      span.attributes.forEach(attribute => {
        if (attribute.key === "http.method") {
          httpMethod = attribute.value.stringValue;
        } else if (attribute.key === "http.target") {
          endpoint = attribute.value.stringValue;
        } else if (attribute.key === "http.status_code") {
          statusCode = attribute.value.intValue;
        }
      })

      const values = [
        span.spanId,
        span.name,
        !!span.traceId ? span.traceId : null,
        !!span.parentSpanId ? span.parentSpanId : null,
        startTimestamp,
        endTimestamp,
        spanLatency,
        instrumentationLibrary,
        JSON.stringify(span.attributes),
        !!statusCode ? statusCode : null,
      ];

      console.log(!!span.traceId ? span.traceId : null)
      console.log(values)

      // Create span
      try {
        client.query(createSpanText, values, (err, res) => {
          if (err) {
            console.log("\nError at insertion-time\n")
            console.log(err.stack)
          } else {
            console.log(res.rows[0])
          }
        });
      } catch(err) {
        console.log(err);
      }

      // if root span create the trace
      if (span.parentSpanId === undefined) {
        const traceLatency = spanLatency;

        const values = [traceId, traceLatency, httpMethod, endpoint, span.spanId, startTimestamp];

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
