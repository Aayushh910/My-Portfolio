const { logToCsv } = require('./csvLogger');

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || req.socket.remoteAddress}`);

  // Log general HTTP request
  logToCsv({
    req: req,
    action: 'HTTP_REQUEST'
  });

  next();
}

module.exports = logger;
