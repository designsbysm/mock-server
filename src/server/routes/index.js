const router = require('express').Router();
const bodyParser = require('body-parser');

// middleware
router.use(bodyParser.json({ limit: '50mb' }));
router.use(require('../middleware/addAuthToken'));
router.use(require('../middleware/checkAuthRole'));
router.use(require('../middleware/errors'));
require('../middleware/passport');

// api endpoints
router.use('/api', require('./api/index'));
router.use('/', require('./static'));

module.exports = router;
