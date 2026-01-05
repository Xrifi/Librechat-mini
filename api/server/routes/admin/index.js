const express = require('express');
const { requireJwtAuth, checkAdmin } = require('~/server/middleware');
const quotas = require('./quotas');
const status = require('./status');
const users = require('./users');
const audit = require('./audit');

const router = express.Router();

router.use(requireJwtAuth);
router.use(checkAdmin);

router.use('/quotas', quotas);
router.use('/status', status);
router.use('/users', users);
router.use('/audit', audit);

module.exports = router;
