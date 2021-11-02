/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

DROP DATABASE IF EXISTS metricsdb;

CREATE DATABASE metricsdb;
\c metricsdb;

CREATE TABLE metricstable (
  name varchar NOT NULL,
  description varchar,
  start_time bigint NOT NULL,
  value int NOT NULL,
  labels jsonb
);
