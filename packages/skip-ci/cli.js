const skipCI = require('.')()

process.exit(1 - skipCI)
