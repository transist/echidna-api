
# Node installation

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

# Testing

curl -w "\n" "echidna1.local:8080/api/brands/converse/keywords/%E4%BC%8D%E6%80%9D%E5%8A%9B

curl -w "\n" -H 'accept: text/*' "echidna1.local:8080/api/brands"

curl -w "\n" -H 'accept: application/octet-stream' "echidna1.local:8080/api/brands"