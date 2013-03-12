# echidna-api

Application Programming Interface for the Echidna system.

# Overview

## api.js: websocket API

* receives websocket connection from echidna-api
 * receives feedconfig
  * feedconfig is associated to socket
   * initial set of data points is sent from historical data

* monitors and receives messages from Redis queues fed by echidna-streaming
 * list of objects containing type and words list
  * for every object
   * find matching realtime feedconfig from all connected client
    * if match found, send data slice

# TODO

Must:

* DONE: retrieve historical data (lib/historical.js) and emit
* change queue based on feedconfig (lib/group.js)
 * if queue is not present as a key, select a random valid queue

Should

* Move all the state data to Redis
 * should be able to instantiate multiple echidna-api processes

Optional

# Installation

## Node.JS installation

```
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
. ~/.bash_profile
nvm ls-remote
nvm install v0.8.19
```

and then install the dependencies:

```
npm install
```

## Development

```
npm -g install supervisor
supervisor api.js
```

## Running tests

```
npm test
```

## nginx

see [https://github.com/transist/echidna/blob/master/echidna1/conf/home/echidna/nginx/conf/nginx.conf nginx.conf]

# Testing integration



# Service

Service is deployed and run in production as user echidna.

See: [https://github.com/transist/echidna/blob/master/echidna1/conf/etc/systemd/system/echidna-api.service echidna-api.service]

look at the logs:

    systemd-journalctl _SYSTEMD_UNIT=echidna-api.service

start the service:

    systemctl start echidna-api.service

restarting the service:

    systemctl restart echidna-api.service

getting the status:

    systemctl status echidna-api.service

