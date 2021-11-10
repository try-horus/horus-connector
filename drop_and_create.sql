/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

DROP DATABASE IF EXISTS horus;

CREATE DATABASE horus;
\c horus;

CREATE TABLE spans (
  span_id varchar PRIMARY KEY,
  span_name varchar NOT NULL,
  trace_id varchar,
  parent_span_id varchar,
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  span_latency int NOT NULL,
  instrumentation_library varchar NOT NULL,
  span_attributes jsonb NOT NULL,
  status_code int
);

CREATE TABLE traces (
  trace_id varchar PRIMARY KEY,
  trace_latency int NOT NULL,
  root_span_http_method varchar,
  root_span_endpoint varchar,
  root_span_id varchar NOT NULL,
  trace_start_time timestamp NOT NULL
);

SELECT * FROM spans;
