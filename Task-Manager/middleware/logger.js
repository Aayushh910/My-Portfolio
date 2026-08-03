function logger(req, res, next) {
  var timestamp = new Date().toISOString();
  console.log(req.method + " " + req.url + " " + timestamp);
  next();
}

module.exports = logger;
