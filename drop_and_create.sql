/* How to run file
  1. In postgres: \i <file path>
  2. In the CLI with psql: psql -d postgres -f <file name>
*/

DROP DATABASE IF EXISTS horus;

CREATE DATABASE horus;
\c horus;

CREATE TABLE spans (
  span_id varchar PRIMARY KEY,
  trace_id varchar NOT NULL, -- Foreign key that references the traces table 
  parent_span_id varchar, -- References another span that might not exist yet
  span_name varchar NOT NULL, -- References the name of the span
  start_time bigint NOT NULL, -- Represents the time in nano seconds that the span started
  end_time bigint NOT NULL, -- Represents the time in nano seconds that the span ended
  span_latency bigint NOT NULL,
  instrumentation_library varchar NOT NULL, -- Represents the instrumentation library that was used to create the span (http, express, etc)
  span_attributes jsonb NOT NULL -- Represents the span attributes, basically the info that is in the span
);

-- I forgot to add an extra field with the latency itself which comes from doing end time - start time
CREATE TABLE traces (
  trace_id varchar PRIMARY KEY,
  root_span_id varchar,
  start_time bigint,
  end_time bigint,
  trace_latency bigint
);

/* Foreign key constraints go here
Spans table:
  - trace_id is a foreign key to the traces table
  - parent_span_id is a foreign key to the spans table itself

Traces table:
  - root_span_id is a foreign key to the spans table

Problems that I see with this:
When we add the first span of a trace to the database,
the entry in traces is not created yet. So we have to check if
there is an entry and if not then create it. The good thing
is that we can do this only one time.

Parent_span_id. This references another span. The problem is that
we don't know if this span exists yet in the database.


Another possible solution: No foreign keys???


So now:
  - When we receive a new spans object, first check the traceId
  and look if it exists in the database. If not, just create the
  entry first before going on to analize the span
  - 

*/

/*
For now we won't have a span_attributes table,
all the attributes of a particular span
will be stored in the span table itself

CREATE TABLE span_attributes (
  id serial PRIMARY KEY,
  span_id varchar NOT NULL,
  attribute_key varchar NOT NULL,
  attribute_value varchar NOT NULL
);

SELECT * FROM spans;

*/



/*
   jsonb

   How to delete in cascade

There is a problem with the foreign keys because sometimes the
entry they are pointing to doesn't exist yet.
Also we have to take in account the foreign key relationships for when
we delete entries from the database

Also, 


We have not discovered yet what the events table is for
So for now we don't need to create it

CREATE TABLE events (
  id serial PRIMARY KEY,
  span_id varchar FOREIGN KEY REFERENCES spans(span_id),
  event_time int NOT NULL
);



SQL command to create the traces table


[CONSTRAINT fk_name]
FOREIGN KEY(fk_columns) 
REFERENCES parent_table(parent_key_columns)
[ON DELETE delete_action]
[ON UPDATE update_action]

*/


