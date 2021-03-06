'use strict';

const Promise   = require('bluebird');
const chai      = require('chai');
chai.use(require("chai-as-promised"));
const expect    = chai.expect;
const mochaPipe = require('../lib/pipe');

const authenticate = () => {
    return Promise.reject(new Error('401'));
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

describe('mocha-pipe', () => {

    it('Should resolve with the result', () => {

        const steps = [{
            name: 'Sync',
            before: () => 1,
            execute: res => res+1,
            after: expectResult(2)
        }];

        return expect(mochaPipe({ name: 'simple test', steps }).run()).to.eventually.equal(2);
    });

    it('Should succeed when log = true', () => {

        const steps = [{
            log: true,
            execute: () => 5
        }];

        return expect(mochaPipe({ name: 'log true', steps }).run()).to.eventually.equal(5);
    });

    it('Should succeed when before method is used', () => {

        const steps = [{
            execute: () => 5
        }];

        const before = done => {
            console.log('     before: Doing some setup work.');
            setTimeout(done, 1500);
        };

        return expect(mochaPipe({ name: 'Test before', steps, before }).run()).to.eventually.equal(5);
    });

    it('Should succeed when no name or before method provided', () => {

        const steps = [{
            execute: () => 5
        }];

        return expect(mochaPipe({ steps }).run()).to.eventually.equal(5);
    });

    it('Should be rejected if no steps provided', () => {
        const noSteps = () => mochaPipe();
        return expect(noSteps).to.throw('No steps defined for pipe.');
    });

    it('Should be rejected if a step has no execute method', () => {
        const steps = [{}];
        const noExecute = () => mochaPipe({ steps });
        return expect(noExecute).to.throw(`Step is missing 'execute' method.`);
    });

    it('Should be fulfilled after catching error', () => {
        const steps = [{
            name: 'Expect error',
            execute: () => authenticate('bad password').catch(catchErr('401')) 
        }];
        return expect(mochaPipe({ steps }).run()).to.eventually.be.fulfilled;
    });

    it('Should be rejected if a step throws an error', () => {

        const steps = [{
            execute: () => {
                throw new Error('Boom!');
            }
        }, {
            execute: res => res
        }];

        const pipe = mochaPipe({ steps, __mochaOff: true });

        console.log('pipe', pipe);

        // __mochaOff simply bypasses the it() call, otherwise my test for a failed test would contain a failed test
        return expect(pipe.run()).to.eventually.be.rejectedWith(Error)
            .and.have.deep.property('message', `Boom!`);
    });

});