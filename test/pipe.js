'use strict';

const Promise = require('bluebird');
const pipe    = require('../lib/pipe');

const authenticate = () => {
    return Promise.try(() => {
        throw new Error('401');
    });
};

const catchErr = expected => err => {
    if (err && err.message === expected) {
        return err;
    }
    throw new Error(`Expected ${expected}, but got ${err.message}`);
};

const expectResult = expected => actual => {
    if (actual !== expected) throw new Error(`Expected ${expected}, but got ${actual}`);
    return actual;
};

const steps = [{
    log: true,
    execute: res => res
}, {
    name: 'Sync',
    before: () => 1,
    execute: res => res+1,
    after: expectResult(2)
}, {
    name: 'Async',
    before: res => res,
    execute: res => Promise.delay(500).then(() => res*2),
    after: expectResult(4)
}, {
    name: 'Expect error',
    execute: () => authenticate('bad password').catch(catchErr('401')) 
}, {
    execute: res => res 
}]

// with all options
pipe({
    name: 'Test Pipeline',
    steps,
    before: done => {
        console.log('     before: Doing some setup work.');
        setTimeout(done, 1500);
    }
});

// with no name or before method
pipe({ steps });

// with no arguments
pipe();

// step without execute
pipe({
    name: 'Test without execute',
    steps: [{}]
});

// step with failure
pipe({
    name: 'Failed test',
    steps: [{
        execute: () => {
            throw new Error('Boom!');
        },
        __resolveOnFailure: true // For self-testing only to get coverage on broken tests
    }, {
        execute: res => res
    }]
});

