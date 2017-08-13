'use strict';

const Promise = require('bluebird');

const maybeLog = (name, log) => hook => res => {
    if (log) {
        console.log(`step:${hook}:`, name || '--');
        console.log(res);
    }
    return res;
};

const getStepName = step => step.name || '--';

const makeTest = (steps, options) => (promise, i) => {
    if (!options.__mochaOff) {
        it(getStepName(steps[i]), done => {
            promise.then(res => done(null, res));
        });
    }
};

const makeTests = (steps, options) => {

    const tests = [];

    steps.map(step => {
        if (!step.execute) {
            throw new Error(`Step is missing 'execute' method.`);
        }
        return new Promise((resolve, reject) => {
            tests.push({ resolve, reject });
        });
    }).forEach(makeTest(steps, options));

    return tests;
};

const executeStep = (step, res) => {
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

    const tests = makeTests(steps, options);

    return Promise.reduce(steps, (res, step, i) => {

        const test = tests[i];

        return Promise.try(() => {
            return executeStep(step, res);
        }).then(res => {
            test.resolve(res);
            return res;
        }).catch(err => {
            test.reject(err);
            i++
            while (i < tests.length) {
                tests[i].resolve(new Error('Previous test failed'));
                i++;
            }
            return Promise.reject(err);
        });

    }, null);

};

module.exports = options => {

    options = options || {};

    const name      = options.name || 'mocha-pipe';
    const steps     = Array.isArray(options.steps) ? options.steps : [];
    const beforeAll = options.before ? options.before : done => done();

    if (steps.length < 1) {
        return Promise.reject(new Error('No steps defined for pipe.'));
    }

    return new Promise((resolve, reject) => {

        try {

            const runPipe = () => {
                pipe(steps, options)
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            };

            if (options.__mochaOff) {
                beforeAll(() => runPipe());
            } else {
                describe(name, () => {
                    before(beforeAll);
                    runPipe();
                });
            }
            
        } catch (err) {
            reject(err);
        }
    });

};