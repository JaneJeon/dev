#!/usr/bin/env node
const skipCI = require('.')()

process.exit(1 - skipCI)
