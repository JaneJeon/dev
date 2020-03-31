const { execSync } = require("child_process");

const commitMsg = execSync("git log -1 --pretty=%s").toString();
const skipCI = /\[skip ci\]|\[ci skip\]/.test(commitMsg);

process.exit(1 - skipCI);
