/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f drop_and_create.sql
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
  start_time_in_microseconds bigint NOT NULL,
  span_latency integer NOT NULL,
  instrumentation_library varchar NOT NULL,
  span_attributes jsonb NOT NULL,
  status_code int
);

CREATE TABLE traces (
  trace_id varchar PRIMARY KEY,
  trace_latency integer NOT NULL,
  root_span_http_method varchar,
  root_span_endpoint varchar,
  root_span_id varchar NOT NULL,
  trace_start_time timestamp NOT NULL,
  contains_errors boolean NOT NULL DEFAULT FALSE,
  root_span_host varchar
);

CREATE TABLE rps (
  time timestamp NOT NULL,
  value int NOT NULL,
  labels jsonb
);

CREATE TABLE eps (
  time timestamp NOT NULL,
  value int NOT NULL,
  labels jsonb
);

CREATE TABLE latency (
  time timestamp NOT NULL,
  total_latency double precision,
  bucket_500 int,
  bucket_1500 int,
  bucket_over_1500 int
);

SELECT create_hypertable('spans', 'start_time');
SELECT create_hypertable('traces', 'trace_start_time');
SELECT create_hypertable('rps', 'time');
SELECT create_hypertable('eps', 'time');
SELECT create_hypertable('latency', 'time');


