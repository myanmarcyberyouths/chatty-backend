const pino = require('pino');

module.exports = pino({
    timestamp: () => `,"timestamp":"${new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(Date.now()))}"`
});
