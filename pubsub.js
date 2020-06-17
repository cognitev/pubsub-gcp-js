const { PubSub } = require('@google-cloud/pubsub');

let pubsub = null;
const topics = [];

/**
 * @function {initClient}
 * @summary setup your pubsub client to authenticate with google
 * @param projectId (str)(optional)(defaults to env GCLOUD_PROJECT_ID_PUBSUB) specifieds the gcp project to push topics/messages to
 * @param clientEmail (str)(optional)(defaults to env GCLOUD_CLIENT_EMAIL) specifies email of the account/service to use
 * @param privateKey (str)(optional)(defaults to env GCLOUD_PRIVATE_KEY) specifies secret private to authorize access to your email/service
 */
const initClient = function(projectId, clientEmail, privateKey) {
  try {
    const conf = {
      projectId: projectId || process.env.GCLOUD_PROJECT_ID_PUBSUB,
      credentials: {
        client_email: clientEmail || process.env.GCLOUD_CLIENT_EMAIL,
        private_key: privateKey.replace(/\\n/g, '\n') || process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
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
 */
const initTopics = async function(passedTopics) {
  if (!pubsub || !Array.isArray(passedTopics)) {
    return {error: 'make sure pubsub is initalized and passed topics is array type'};
  }
  passedTopics.forEach(async t => {
    await addTopic(t);
  });
};

/**
 * @function {addTopic}
 * @summary add a new topic to the list of targeted topics
 * @param topic (string)(required) topic name you want to add (will be auto created if not existant in project)
 */
const addTopic = async function(topic) {
  if (typeof (topic) !== 'string') {
    return {error: 'topic passed should be string'};
  }
  try {
    const topic = pubsub.topic(topic);
    await topic.get({ autoCreate: true });
  } catch (err) {
    throw Error(`failed to setup/check for new topic | ${err}`);
  }
  topics.push(topic);
  return true;
};

/**
 * @function {topicExits}
 * @summary check if topic name is supported in your list of targeted topics
 * @param topic (string)(required) topic name you want to check
 */
const topicExits = function(topic) {
  return topics.includes(topic);
};

/**
 * @function {topicExits}
 * @summary check if topic name is supported in your list of targeted topics
 * @param payload (string | hashmap)(required) data to be sent as message
 */
const pushEvent = async function(payload, topicName) {
  if (!pubsub || !topicExits(topicName)) {
    return {error: 'make sure pubsub is intitalized and topic is registered before using it'};
  }

  try {
    const topic = pubsub.topic(topicName);
    const data = Buffer.from(JSON.stringify(payload));

    const messageId = await topic.publish(data);
    return messageId;
  } catch (err) {
    throw Error(`failed to process message/topic | ${err}`);
  }
};


export default {
  initClient,
  initTopics,
  addTopic,
  topicExits,
  pushEvent,
};
