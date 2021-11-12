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
  total_latency double precision,
  bucket_500 int,
  bucket_1500 int,
  bucket_over_1500 int
);
