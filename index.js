////////// Dashboard
const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())

const port = 3002

app.get("/", (req, res) => {
  res.json("Hello World")
})

app.post('/v1/traces', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2))
  res.send("ok")
})

app.post('/v1/metrics', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2))
  console.log("NEW REQUEST!!!!")
  res.type('json')
})

app.post("/", (req, res) => {
  console.log("THIS IS A REGULAR POST")
  let request = req.body
  if (request.resourceMetrics && request.resourceMetrics[0]) {
    console.log("This is resources")
    console.log(response.resourceMetrics[0].resource)
  } else if (request.resourceSpans) {
    console.log("This is SPANS")
    console.log(request.resourceSpans[0].resource)
  } else {
    console.log("This is else")
    console.log(request)
  }
  res.send("ok")
})

app.listen(port, () => console.log("Listening on the port"))
