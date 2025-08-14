require('dotenv').config();
const http = require('http');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/errorController');

module.exports = (app) => {
  const server = http.createServer(app);

  app.use('/', (req, res, next) => {
    if (req.path === '/') {
      res.send('Task Management API is Working.............');
    } else {
      next();
    }
  });

  app.all('/*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });
  
  app.use(globalErrorHandler);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Task Management Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });
};
