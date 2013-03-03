# echidna-api

Application Programming Interface for the Echidna system.

# Node.JS installation

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

# Development

```
npm -g install supervisor
supervisor app.js
```

# Running tests

```
npm test
```

# URL command-line encoding

To encode characters suitable for encoder:

http://meyerweb.com/eric/tools/dencoder/

# Testing locally

```
curl -w "\n" "echidna1.local:8080/api/brands/converse/keywords/%E4%BC%8D%E6%80%9D%E5%8A%9B
curl -w "\n" -H 'accept: text/*' "echidna1.local:8080/api/brands"
curl -w "\n" -H 'accept: application/octet-stream' "echidna1.local:8080/api/brands"
```

# Testing API (remotely)

```
curl -k -w "\n" "https://echidna.transi.st/api"
curl -k -w "\n" "https://echidna.transi.st/api/brands"
curl -k -w "\n" "https://echidna.transi.st/api/brands/converse"
curl -k -w "\n" "https://echidna.transi.st/api/brands/converse/keywords"
curl -k -w "\n" "https://echidna.transi.st/api/brands/converse/keywords/%E5%A4%A7"
curl -k -w "\n" -H 'accept: text/html' "https://echidna.transi.st/api/brands/converse/keywords/%E5%A4%A7"
```

# Service

 systemd-journalctl _SYSTEMD_UNIT=echidna-api.service

 systemctl start echidna-api.service
