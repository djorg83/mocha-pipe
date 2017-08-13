# mocha-pipe
Build a test pipeline with mocha

[![Build Status](https://travis-ci.org/djorg83/mocha-pipe.svg?branch=master)](https://travis-ci.org/djorg83/mocha-pipe) [![Coverage Status](https://coveralls.io/repos/djorg83/mocha-pipe/badge.svg?branch=master)](https://coveralls.io/r/djorg83/mocha-pipe?branch=master) [![NPM version](http://img.shields.io/npm/v/mocha-pipe.svg)](https://www.npmjs.com/package/mocha-pipe)
[![Downloads](https://img.shields.io/npm/dm/mocha-pipe.svg)](https://www.npmjs.com/package/mocha-pipe)
[![David](https://img.shields.io/david/djorg83/mocha-pipe.svg?maxAge=2592000)](https://github.com/djorg83/mocha-pipe)
[![devDependencies Status](https://david-dm.org/djorg83/mocha-pipe/dev-status.svg)](https://david-dm.org/djorg83/mocha-pipe?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/djorg83/mocha-pipe.svg?maxAge=2592000)](https://github.com/djorg83/mocha-pipe)
[![license](https://img.shields.io/github/license/djorg83/mocha-pipe.svg?maxAge=2592000)](https://github.com/djorg83/mocha-pipe)
[![GitHub stars](https://img.shields.io/github/stars/djorg83/mocha-pipe.svg?style=social&label=Star&maxAge=2592000)](https://github.com/djorg83/mocha-pipe)
[![Built with love](https://img.shields.io/badge/built%20with-love-ff69b4.svg)](https://img.shields.io/badge/built%20with-love-ff69b4.svg)
[![Powered by mocha](https://img.shields.io/badge/powered%20by-mocha-yellowgreen.svg)](https://img.shields.io/badge/powered%20by-mocha-yellowgreen.svg)

[![Gittip](http://img.shields.io/gittip/djorg83.svg)](https://www.gittip.com/djorg83/)


[![NPM](https://nodei.co/npm/mocha-pipe.png?downloads=true&stars=true)](https://nodei.co/npm/mocha-pipe/)

## mocha-pipe
mocha-pipe allows you to define your tests as a series of asynchronous units of work. Collectively the individual steps make up the pipeline. Each step pipes its output into the next step. If any uncaught exception occurs, the pipe is considered broken, and the step which threw the error will show as broken.

### Install

```bash
npm install react-bootstrap-sweetalert
```

### Basic Example
```javascript
const pipe = require('mocha-pipe');

const steps = [{
    name: 'Get user', // it(name, ...);
    before: () => 'MOCHA_PIPE', // before hook
    execute: (username) => getUser(username),
    after: res => assertSomething(res) // after hook
}, {
    name: 'Update user email',
    execute: user => updateEmail(user, 'a@b.com'),
    after: res => assertSomething(res)
}, {
    name: 'Expect 401 on invalid password',
    execute: user => authenticate(user, 'bad password').catch(err => isStatus(err, '401')) 
}];

const options = {
    name  : 'Basic Example', // describe(name, ...);
    steps : steps
};

pipe(options);
```

