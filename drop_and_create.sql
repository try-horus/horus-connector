/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

DROP DATABASE IF EXISTS horus;

CREATE DATABASE horus;
\c horus;

CREATE TABLE spans (
  id varchar PRIMARY KEY,
  trace_id varchar NOT NULL,
  parent_span_id varchar,
  start_time int NOT NULL,
  end_time int NOT NULL,
  instrumentation_library varchar NOT NULL
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  span_id varchar PRIMARY KEY REFERENCES spans(span_id),
  event_time int NOT NULL
);

CREATE TABLE span_attributes (
  id serial PRIMARY KEY,
  span_id varchar NOT NULL,
  attribute_key varchar NOT NULL,
  attribute_value varchar NOT NULL
);

SELECT * FROM spans;
