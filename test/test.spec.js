const assert = require('assert');
const { describe, it} = require('mocha');
const pubsub = require('../pubsub');
const gcpMockClient = require('google-pubsub-mock');

const topicName = 'testTopic';
const subscriptionName = 'testSub';

gcpMockClient.setUp({
  topics: {
    [topicName]: {
      subscriptions: [subscriptionName],
    },
  },
});

describe('Basic Publish Message Scenario', () => {
  it('should wait for intialization before publishing', async() => {
    try {
      await pubsub.publish({bb: 12}, topicName);
      assert.fail('client not intialized expected to throw error');
    } catch (err) {
      assert.equal(String(err).includes('pubsub is not intitalized'), true);
    }
  });
  it('should throw error with malformed credentials', async() => {
    try {
      await pubsub.initClient('test_project', 'test@email.com', {});
      assert.fail('client intialized with faulty credentials expected to throw error');
    } catch (err) {
      assert.equal(String(err).includes('failed to setup pubsub |'), true);
    }
  });
  it('should publish message on a topic', async() => {
    await pubsub.initClient('test_project', 'test@email.com', 'fake key');
    const res = await pubsub.publish({bb: 12}, topicName);
    assert.equal(res.error, undefined);
    assert.equal('messageId' in res, true);
  });
});
