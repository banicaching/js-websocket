
	"use strict";

	// Optional. You will see this name in eg. 'ps' or 'top' command
	process.title = "node-notification";

	/**
	 *  Global variables: server information and client information
	 * 
	 */
	var fs = require('fs');
	var webSocketServer = require('websocket').server;
	var https = require('https');
	var webSocketsServerPort = '<YOUR_WEBSOCKET_SERVER_PORT>';
	var options = {
		key: fs.readFileSync('<YOUR_SSL_KEY>').toString(),
		cert: fs.readFileSync('<YOUR_SSL_CRT>').toString()
	};
	var clients = [ ];

	/**
	 *  Helper function for escaping input strings
	 *  @params String
	 * 
	 */
	function htmlEntities(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
						  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	/**
	 *  Create HTTPs server
	 *  @params security options, callback function
	 *  
	 */
	var server = https.createServer(options, function(request, response) {
		// Not important for us. We're writing WebSocket server, not HTTPs server
	});
	
	server.listen(webSocketsServerPort, function() {
		console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
	});

	/**
	 *  Create WebSocket server
	 *  @params httpsServer
	 *  
	 */
	var wsServer = new webSocketServer({
		httpServer: server
	});

	/**
	 *  WebSocket server callback function
	 *  @params action, callback function
	 *  
	 */
	wsServer.on('request', function(request) {
		
		console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

		// Accept connection - 'request.origin'
		var connection = request.accept(null, request.origin); 
		
		// Client index - for calculate client number
		var index = clients.push(connection) - 1;

		// For sender and recevier
		var userName = false;
		var recevierName = false;

		console.log((new Date()) + ' Connection accepted.');

		// Use sent some message
		connection.on('message', function(message) {
		
			// Accept only text
			if (message.type === 'utf8') { 
					
				// First message sent by user is their name, recevier name, and message text
				userName = htmlEntities(JSON.parse(message.utf8Data).name);
				recevierName = htmlEntities(JSON.parse(message.utf8Data).recevier);
				
				console.log((new Date()) + ' User is known as: ' + userName);
				
				// Put custom data into client array
				clients[index]['clientName'] = userName;
				clients[index]['recevierName'] = recevierName;

				console.log((new Date()) + ' Received Message from '
							+ userName + ': ' + JSON.parse(message.utf8Data).text);

				// Send success message to current client, when register
				clients[index].sendUTF(0);
				
				// Sent data obj
				var obj = {
					name: userName,
					time: (new Date()).getTime(),
					text: htmlEntities(JSON.parse(message.utf8Data).text),
					recevier: recevierName
				};

				// Send message
				var json = JSON.stringify({ type:'message', data: obj });
				if (obj.recevier == '0xFFFFFFFF') { // Broadcast tags
					for (var i = 0; i < clients.length; i++) {
						 clients[i].sendUTF(json);
					}
				} else {	
					for (var i = 0; i < clients.length; i++) {
						var clientName = clients[i].clientName;
						if (obj.recevier == clientName) {
							 clients[i].sendUTF(json);
						}
					}
				}
			}
		});

		/**
		 *  User disconnected
		 *  @params action, callback function
		 *  
		 */
		connection.on('close', function(connection) {
			if (userName !== false) {
				console.log((new Date()) + " Peer [" + index + "] "
					+ this.remoteAddress + " disconnected.");
				
				// remove user from the list of connected clients
				clients.splice(index, 1);
			}
		});
	});
