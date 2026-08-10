import * as t from 'ts-fortress';

// Custom default values
const ServerConfig = t.record({
  port: t.number(3000), // custom default: 3000
  host: t.string('localhost'), // custom default: 'localhost'
  retries: t.number(5), // custom default: 5
});

assert.deepStrictEqual(ServerConfig.defaultValue, {
  port: 3000,
  host: 'localhost',
  retries: 5,
} satisfies t.TypeOf<typeof ServerConfig>);

// Enum types have built-in defaults

const JobStatus = t.enumType(['started', 'scheduled', 'succeeded', 'failed']); // default: "started"

const JobFulfilledStatus = t.enumType(['succeeded', 'failed', 'cancelled']); // default: "succeeded"

// Intersection types require explicit defaults
const ReportStatus = t.intersection(
  [JobStatus, JobFulfilledStatus],
  t.enumType(['succeeded', 'failed']), // must provide combined default
);

// embed-sample-code-ignore-below
assert.isTrue(
  ReportStatus.defaultValue ===
    ('succeeded' satisfies t.TypeOf<typeof ReportStatus>),
);
