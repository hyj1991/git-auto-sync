'use strict';

const DingBot = require('dingbot');
const cp = require('child_process');
const promisify = require('util').promisify;
const exec = promisify(cp.exec);

class AutoSync {
  constructor(from, to, gitpath, webhook) {
    if (webhook) {
      this.dingbot = new DingBot(webhook);
    }
    this.from = from.split('/');
    this.to = to.split('/');
    this.options = { cwd: gitpath };
    this.stdout = '';
  }

  concat(data) {
    this.stdout += data.stdout;
    this.stdout += data.stderr;
  }

  async sync() {
    this.concat(await exec(`git fetch ${this.from.join(' ')}`, this.options));
    this.concat(await exec(`git checkout ${this.to.join('_')}`, this.options));
    this.concat(await exec(`git pull ${this.to.join(' ')}`, this.options));
    this.concat(await exec(`git reset --hard ${this.from.join('/')}`, this.options));
    this.concat(await exec(`git push -f ${this.to.join(' ')}`, this.options));
    await this.notification();
  }

  async notification() {
    if (this.dingbot) {
      this.stdout += `at ${new Date()}`
      await this.dingbot.markdown('GYP Sync', '#### **GYP Sync**\n' + this.stdout.split('\n').map(stdout => `- ${stdout}`).join('\n'));
    }
  }
}

module.exports = AutoSync;
