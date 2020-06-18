const {PubSub} = require('@google-cloud/pubsub');

let pubsub = null;

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
 * @function {publish}
 * @summary publish a message on the specified topic
 * @param payload (string | hashmap)(required) data to be sent as message
 * @param topicName {String} name of the topic to use for publishing
 * @param createTopic {Boolean} whether to create the topic if not found or not before publishing
 * @returns {String} id of the message sent
 */
const publish = async function(payload, topicName, createTopic = false) {
  if (!pubsub) {
    throw Error('pubsub is not intitalized');
  }

  try {
    const topic = pubsub.topic(topicName);
    if (createTopic){
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
  publish,
};
