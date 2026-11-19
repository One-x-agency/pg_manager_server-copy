const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
// const helmet = require('helmet');
const Logger = require('./lib/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./components/routes');
const MarkdownServer = require('./lib/markdownServer');
const constants = require('@/config/constant');

const app = express();

// For security purpose
// app.use(helmet());

app.use(morgan(':method :url Status : :status, Time taken: :response-time ms', {
  stream: {
    write: (message) => Logger.info(message),
  },
}));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health check route to verify if the server is running or not
app.get('/health', (req, res) => {
  res.send('ok');
});

app.use('/docs/style', express.static(path.join(__dirname, '../docs/style')));
app.use('/docs/js', express.static(path.join(__dirname, '../docs/js')));
app.use('/docs', MarkdownServer('docs'));
app.use('/files', express.static(constants.fileStoragePath));
app.use('/api', apiRoutes);

app.use(errorHandler);

module.exports = app;
