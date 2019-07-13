#!/usr/bin/env node

'use strict'

const AutoSync = require('../lib');
new AutoSync(...process.argv.slice(2)).sync();