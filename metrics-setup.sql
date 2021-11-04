/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

CREATE TABLE rps (
  name varchar NOT NULL,
  description varchar,
  time bigint NOT NULL,
  value int NOT NULL,
  labels jsonb
);

CREATE TABLE eps (
  name varchar NOT NULL,
  description varchar,
  time bigint NOT NULL,
  value int NOT NULL,
  labels jsonb
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
