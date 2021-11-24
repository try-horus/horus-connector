////////// Dashboard
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')

const connectionString = "postgres://callie:callie@localhost:5432/horus"
//const connectionString = "postgres://juan:juan@localhost:5432/horus"
//const connectionString = `postgres://horus_admin:horus_admin@localhost:5434/horus`
//const connectionString = `postgres://${process.env.POSTGRES_ADMIN}:${process.env.POSTGRES_PASSWORD}@${process.env.DB_CONTAINER_NAME}:${process.env.DB_PORT}/${process.env.DB_NAME}`


const client = new Client({connectionString})
client.connect()
  .then(() => {
    console.log("Connected successfully to the database");
    console.log(connectionString)
  })
  .catch(error => console.log(error))

app.use(express.json({limit: '50mb'}));
app.use(cors())

const port = 3002

app.get("/", (req, res) => {
  res.json("Hello World")
})

app.post('/v1/traces', async (req, res) => {
  console.log("A trace has hit me!")
  if (!req.body.resourceSpans) return
  const allSpansArray = req.body.resourceSpans[0]["instrumentationLibrarySpans"]
  const createSpanText = 'INSERT INTO spans(span_id, span_name, trace_id, parent_span_id, start_time, end_time, start_time_in_microseconds, span_latency, instrumentation_library, span_attributes, status_code) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)'
  const createTraceText = 'INSERT INTO traces(trace_id, trace_latency, root_span_http_method, root_span_endpoint, root_span_id, trace_start_time, root_span_host, contains_errors) VALUES($1, $2, $3, $4, $5, $6, $7, $8)'


  const acceptableCodeBeginnings = ["2", "3"]
  let traceContainsErrors = false

  allSpansArray.forEach(element => {
    const spansFromOneLibrary = element.spans
    const instrumentationLibrary = element["instrumentationLibrary"]["name"]

    spansFromOneLibrary.forEach(span => {
      const nanoToMicroSeconds = 1000;
      const nanoToMiliseconds = 1000000
      const spanLatency = Math.round((span.endTimeUnixNano - span.startTimeUnixNano)/nanoToMicroSeconds);
      const startTimestamp = new Date(span.startTimeUnixNano/nanoToMiliseconds);
      const endTimestamp = new Date(span.endTimeUnixNano/nanoToMiliseconds);
      const startTimeInMicroseconds = Math.round(span.startTimeUnixNano/nanoToMicroSeconds)

      // Retrieve attribute values for span and trace SQL insertion
      let httpMethod, endpoint, statusCode, host;

      span.attributes.forEach(attribute => {
        if (attribute.key === "http.method") {
          httpMethod = attribute.value.stringValue;
        } else if (attribute.key === "http.target") {
          const value = attribute.value.stringValue;
	        endpoint = value;
        } else if (attribute.key === "http.status_code") {
          statusCode = attribute.value.intValue;
	        if (!acceptableCodeBeginnings.includes(String(statusCode)[0])) traceContainsErrors = true
        } else if (attribute.key === "http.host") {
          host = attribute.value.stringValue;
        }
      });

      // Filter out traces from the metrics endpoint
      if (endpoint === "/v1/metrics") { return }

      const values = [
        span.spanId,
        span.name,
        !!span.traceId ? span.traceId : null,
        !!span.parentSpanId ? span.parentSpanId : null,
        startTimestamp,
        endTimestamp,
	      startTimeInMicroseconds,
        spanLatency,
        instrumentationLibrary,
        JSON.stringify(span.attributes),
        !!statusCode ? statusCode : null,
      ];


      // Create span

      client.query(createSpanText, values, (err, res) => {
        if (err) {
          console.log("\nError at insertion-time\n")
          console.log(err.stack)
        } else {
          //console.log(res.rows[0])
        }
      });

      // if root span create the trace
      if (span.parentSpanId === undefined) {
        const traceLatency = spanLatency;

        const values = [span.traceId, traceLatency, httpMethod, endpoint, span.spanId, startTimestamp, host, traceContainsErrors];

        client.query(createTraceText, values, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            //console.log(res.rows[0])
          }
        })
      }
    });
  })

  res.send("ok")
})

app.post('/v1/metrics', (req, res) => {
  console.log("A metric has hit me!")
  if (!req.body.resourceMetrics[0]) return;

  const allMetricsArray = req.body.resourceMetrics[0].instrumentationLibraryMetrics[0].metrics
  let tableName;

  allMetricsArray.forEach(metric => {

    if (metric.name === "request_count") {
      insertRPSorEPSdata(metric, "rps")
    } else if (metric.name === "error_count") {
      insertRPSorEPSdata(metric, "eps")
    } else if (metric.name === "request_latency") {
      insertLatencyData(metric)
    }
  })

  res.type('json')
})

const insertRPSorEPSdata = (metric, tableName) => {
  const dataPoints = metric.doubleSum.dataPoints[0]
  const text = `INSERT INTO ${tableName}(time, value, labels) VALUES(to_timestamp($1), $2, $3)`
  let currentDate = new Date()
  const offset = currentDate.getTimezoneOffset() * 60000
  currentDate = new Date(currentDate.getTime() - offset)
  const values = [currentDate.getTime()/1000, dataPoints.value, JSON.stringify(dataPoints.labels)]

  client.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      //console.log(res.rows[0])
    }
  })
}

const insertLatencyData = (metric) => {
  const data = metric.doubleHistogram.dataPoints[0]
  const text = `INSERT INTO latency VALUES(to_timestamp($1), $2, $3, $4, $5)`

  const [b500, b1500, bover1500] = data.bucketCounts
  let currentDate = new Date()
  const offset = currentDate.getTimezoneOffset() * 60000
  currentDate = new Date(currentDate.getTime() - offset)
  const values = [currentDate.getTime()/1000, parseFloat(data.sum), b500, b1500, bover1500]

  client.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      //console.log(res.rows[0])
    }
  })
}

app.listen(port, () => console.log("Listening on the port 3002"))
