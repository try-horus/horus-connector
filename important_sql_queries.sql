/* Find the requests per second */
SELECT start_time AS "time",
(
	CASE
		WHEN value >= lag(value) OVER w
			THEN value - lag(value) OVER w
		WHEN lag(value) OVER w IS NULL THEN NULL
		ELSE value
	END
) AS "requests"
FROM metricstable
WHERE to_timestamp(start_time / 1000000.0) > NOW() - INTERVAL '1 day'
WINDOW w AS (ORDER BY start_time)
ORDER BY start_time;
