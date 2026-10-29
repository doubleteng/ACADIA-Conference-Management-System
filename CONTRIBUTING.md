# Contributing

Keep improvements reusable across conference years. Put annual policy and content in configuration, not fixed dates, contacts or Drive IDs. Update the relevant reader, template schema, documentation and tests together when a data contract changes.

Run `npm ci`, `npm run build`, and `npm test` with a supported Node version. Commit the rebuilt `configure.html`, `editor-demo.html`, `sources.json`, and generated module files with source changes. The build synchronizes shared code and derives editor previews from the portal markup. Use fictional data only. Explain the triggering problem, resulting behavior and validation in a pull request.

Never submit credentials, private configurations, populated rosters or production exports. Report credential or participant-data exposure privately to the repository maintainer rather than placing the data in a public issue. This repository does not include an audit certification.
