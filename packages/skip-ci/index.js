const { execSync } = require('child_process')

module.exports = () => {
  const commitMsg = execSync('git log -1 --pretty=%s').toString()
  const skipCI = /\[skip ci\]|\[ci skip\]/.test(commitMsg)

  return skipCI
}
