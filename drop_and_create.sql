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
  end_time int NOT NULL
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  span_id varchar PRIMARY KEY REFERENCES spans(span_id),
  event_time int NOT NULL
);

CREATE TABLE attribute_values (
  id serial PRIMARY KEY,
  value varchar NOT NULL
);

CREATE TABLE attribute_keys (
  id serial PRIMARY KEY,
  key varchar NOT NULL
);

CREATE TABLE source_types (
  id serial PRIMARY KEY,
  type varchar NOT NULL
);

CREATE TABLE attributes (
  id serial PRIMARY KEY,
  value_id int NOT NULL REFERENCES attribute_values(id),
  key_id int NOT NULL REFERENCES attribute_keys(id),
  source_type int NOT NULL REFERENCES source_types(id),
  source_id varchar NOT NULL
);
