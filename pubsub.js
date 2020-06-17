const {PubSub} = require('@google-cloud/pubsub');

let pubsub = null;
let topics = [];

/**
 * @function {initClient}
 * @summary setup your pubsub client to authenticate with google
 * @param projectId {String} (optional)(defaults to env GCLOUD_PROJECT_ID_PUBSUB) specifieds the gcp project to push topics/messages to
 * @param clientEmail {String} (optional)(defaults to env GCLOUD_CLIENT_EMAIL) specifies email of the account/service to use
 * @param privateKey {String}(optional)(defaults to env GCLOUD_PRIVATE_KEY) specifies secret private to authorize access
 * @param pubsubClient {object}(optional)(defaults to null) you could use this param to initialize it with a ready pub/sub client
 * @returns {None}
 */
const initClient = async function(projectId, clientEmail, privateKey) {
  try {
    const conf = {
      projectId: projectId || process.env.GCLOUD_PROJECT_ID_PUBSUB,
      credentials: {
        client_email: clientEmail || process.env.GCLOUD_CLIENT_EMAIL,
        private_key: (privateKey || process.env.GCLOUD_PRIVATE_KEY).replace(/\\n/g, '\n'),
      },
    };
    pubsub = new PubSub(conf);
  } catch (err) {
    pubsub = null;
    throw Error(`failed to setup pubsub | ${err}`);
  }
};

/**
 * @function {initTopics}
 * @summary intialize the topics you want to push messages to
 * @param passedTopics (Array)(required) the list of topic names you want to add (will be auto created if not existant in project)
 * @returns {None}
 */
const initTopics = async function(passedTopics) {
  if (!pubsub || !Array.isArray(passedTopics)) {
    return {error: 'make sure pubsub is initalized and passed topics is array type'};
  }
  topics = [];
  passedTopics.forEach(async t => {
    try {
      await addTopic(t);
    } catch (err) {
      console.log(err);
    }
  });
};

/**
 * @function {addTopic}
 * @summary add a new topic to the list of targeted topics
 * @param topic (string)(required) topic name you want to add (will be auto created if not existant in project)
 * @returns {object} to flag success/failure of operation using keys success/error
 */
const addTopic = async function(topic) {
  if (typeof (topic) !== 'string') {
    return {error: 'topic passed should be string'};
  }
  topics.push(topic);
  return {success: true};
};

/**
 * @function {topicExists}
 * @summary check if topic name is supported in your list of targeted topics
 * @param topic (string)(required) topic name you want to check
 * @returns {boolean}
 */
const topicExists = function(topic) {
  return topics.includes(topic);
};

/**
 * @function {topicExits}
 * @summary check if topic name is supported in your list of targeted topics
 * @param payload (string | hashmap)(required) data to be sent as message
 * @returns {String} id of the message sent
 */
const publish = async function(payload, topicName) {
  if (!pubsub) {
    return {error: 'make sure pubsub is intitalized'};
  }
  if (!topicExists(topicName)) {
    return {error: 'make sure topic is registered before using it'};
  }

  try {
    const topic = pubsub.topic(topicName);
    if (topic.get){
      await topic.get({ autoCreate: true });
    }
    const data = Buffer.from(JSON.stringify(payload));

    const messageId = await topic.publish(data);
    return {messageId: messageId};
  } catch (err) {
    throw Error(`failed to process message/topic | ${err}`);
  }
};


module.exports = {
  initClient,
  initTopics,
  addTopic,
  topicExists,
  publish,
};
