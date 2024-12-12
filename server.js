require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const csrf = require('csurf');
const compression = require('compression');
const responseTime = require('response-time');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const winston = require('winston');
const expressWinston = require('express-winston');
const todoRoutes = require('./routes/todoRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const { limiter, rateLimiterMiddleware, securityHeaders } = require('./middleware/security');
const Redis = require('ioredis');
const apm = require('elastic-apm-node').start({
  serviceName: 'ultimate-express-server',
  serverUrl: 'https://your-apm-server'
});

const app = express();

const redis = new Redis();

// Security Middlewares
app.use(helmet());
app.use(securityHeaders);
app.use(csrf({ cookie: true }));
app.use(rateLimiterMiddleware);
app.use(limiter);

// Performance and Response Time
app.use(compression());
app.use(responseTime());

// Logging Middleware
app.use(morgan('combined'));

// Winston Logging Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
}));

// Body Parser Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// OpenAPI Documentation Middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handling Middleware
app.use(errorHandler);

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
