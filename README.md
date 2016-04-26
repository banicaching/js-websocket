# js-websocket
- For push notification/chat with certain user via web browser.

## How to use?
#### Step0. Install nodeJS and Websocket Server

###### Command for centos
```bash
  $ yum install nodejs
  $ yum install npm
  $ npm install websocket
```

#### Step1. Set up wssServer.js
  
```js
  var https = require('https');
  var webSocketsServerPort = '<YOUR_WEBSOCKET_SERVER_PORT>';
  var options = {
  	key: fs.readFileSync('<YOUR_SSL_KEY>').toString(),
  	cert: fs.readFileSync('<YOUR_SSL_CRT>').toString()
  };
```

###### Command
```bash
  $ node wssServer.js
```

#### Step2. Set up wssClient.js

```js	
  var connection = new WebSocket('wss://<YOUR_WEBSOCKET_SERVER_DOMAIN/IP>:<YOUR_WEBSOCKET_SERVER_PORT>');
```
