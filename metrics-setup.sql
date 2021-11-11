/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

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
  total_latency bigint,
  bucket_500 int,
  bucket_1000 int,
  bucket_1500 int,
  bucket_2000 int,
  bucket_2500 int,
  bucket_over_2500 int
);

/*
CREATE TABLE rps_per_endpoint (
  name varchar NOT NULL,
  description varchar,
  time bigint NOT NULL,
  value int NOT NULL,
  labels jsonb
);
*/
