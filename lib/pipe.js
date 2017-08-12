'use strict';

const chai    = require('chai');
const Promise = require('bluebird');

chai.use(require("chai-as-promised"));

const expect = chai.expect;

const maybeLog = (name, log) => hook => res => {
    if (log) {
        console.log(`step:${hook}:`, name || '--');
        console.log(res);
    }
    return res;
};

const expectToBeFulfilled = promise => expect(promise).to.eventually.be.fulfilled;

const getStepName = step => step.name || '--';

const makeTest = (steps, promise, i) => it(getStepName(steps[i]), () => expectToBeFulfilled(promise));

const makeTests = (steps) => {

    const tests = [];

    steps.map(step => {
        if (!step.execute) {
            throw new Error(`Step is missing 'execute' method.`);
        }
        return new Promise((resolve, reject) => {
            tests.push({ resolve, reject });
        });
    }).forEach(makeTest.bind(null, steps));

    return tests;
};

const executeStep = (step , res) => {
    const log = maybeLog(step.name, step.log);
    return Promise.try(() => {
        return step.before ? Promise.try(() => step.before(res)).then(log('before')) : res;
    }).then(res => {
        return Promise.try(() => step.execute(res)).then(log('execute'));
    }).then(res => {
        return step.after ? Promise.try(() => step.after(res)).then(log('after')) : res;
    });
};

const pipe = (steps, options) => {

    let tests;
    try {
        tests = makeTests(steps);
    } catch (err) {
        return console.log(err);
    }

    let kill = false;

    Promise.reduce(steps, (res, step, i) => {

        if (kill) return;

        const test = tests[i];

        return Promise.try(() => {
            return executeStep(step, res);
        }).then(res => {
            test.resolve();
            return res;
        }).catch(err => {
            step.__resolveOnFailure ? test.resolve(err) : test.reject(err);
            i++

            kill = true;
            while (i < tests.length) {
                tests[i].resolve(new Error('Previous test failed'));
                i++;
            }
        });

    }, null);
};

module.exports = (options) => {

    options = options || {};

    const name      = options.name || 'mocha-pipe';
    const steps     = Array.isArray(options.steps) ? options.steps : [];
    const beforeAll = options.before ? options.before : done => done();

    if (steps.length < 1) {
        console.log('No steps defined for pipe.');
        return;
    }

    describe(name, () => {
        before(beforeAll);
        pipe(steps, options);
    });
};