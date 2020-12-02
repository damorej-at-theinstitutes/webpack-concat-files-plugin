const { spawn } = require('child_process');

(async () => {
  await spawn('npm', ['test'], { stdio: 'inherit' });
})();
