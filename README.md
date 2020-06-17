# pubsub-gcp-js

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Build Status:](https://github.com/cognitev//pubsub-gcp-js/workflows/Node/badge.svg)](https://github.com/cognitev/pubsub-gcp-js/actions)

Wrapping package around gcp pubsub package to provide a more conveniet, abstract functionalities

## how to install

```shell
npm i --save pubsub-gcp
```

## how to use

- first step is to initialize pubsub client with your account credentialis

```js
const pubsub = require('pubsub-gcp');
const privateKey = 'gcp_private_key';
const email = 'account_email';
const projectId = 'target_gcp_project';
await pubsub.initClient(projectId, email, privateKey);
```

 here you have 3 params that you get from your account on GCP to authorize the package
 to publish messages on your behalf.

Note: if you pass any of those params as `null` or did not pass any of them at all, they will replaced by the
following envs respectively:

- `GCLOUD_PROJECT_ID_PUBSUB`
- `GCLOUD_CLIENT_EMAIL`
- `GCLOUD_PRIVATE_KEY`

- second step is to register your topics, so that you know which topics you are sending messages to. trying to publish on
any topic that was not regsitered here will not be allowed even if it exits.

```js
await pubsub.initTopics(['t1', 't2', 't3'])
```

to assert that a topic is registered:

```js
pubsub.topicExists('t1'); // true
pubsub.topicExists('t222'); // false
```

- finally to publish a message on any of your topics:

```js
await pubsub.publish({'random': 'message'}, 't2'); // will return message id on topic
```

Note that even if the topic does not exit on your project on GCP, the registered topic you entered will be automatically
created on first publish on your project.

- you can add topics later to your list of topics using

```js
pubsub.addTopic('t4')
```
