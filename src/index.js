require('module-alias/register');

const http = require('http');
const vars = require('./config/var');
const app = require('./app');
const Logger = require('./lib/logger');

const { port, env } = vars;

const server = http.createServer(app);

Logger.info(`ENV : ${env}`);

server.listen(port, () => {
  Logger.info(`Server PORT : ${port}`);
});

module.exports = app;
