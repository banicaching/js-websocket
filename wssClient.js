$(function () {
	"use strict";

	// Define DOM for handle socket message
	var notiContent = $('#noti-content');
	var notiUserName = $('#noti-username');
	var notiMsg = $('#noti-msg');
	var notiReceiver = $('#noti-receiver');
	var notiStatus = $('#noti-status');

	window.WebSocket = window.WebSocket || window.MozWebSocket;

	if (!window.WebSocket) {
		// Try to get notification for db
		notiStatus.text('This browser doesn\'t support WebSockets.');
		console.log('This browser doesn\'t support WebSockets.');
		return;
	}

        // Modify server IP and port
	var connection = new WebSocket('wss://<YOUR_WEBSOCKET_SERVER_DOMAIN/IP>:<YOUR_WEBSOCKET_SERVER_PORT>'); 
		
	connection.onopen = function () {
		notiStatus.text("WebSocket Connected!");
	};

	connection.onerror = function (error) {
		notiStatus.text("WebSocket Disconnected!");
		console.log("There\'s some problem with your connection or the server is down.");							
	};

	/*** 
	  * On messages 
	  *
	  * Try to parse JSON message. 
	  *
	  **/
	connection.onmessage = function (message) { 
		try {
			var json = JSON.parse(message.data);
			if (message.data == 0) {
				console.log("Register successfully.");
			} else if (json.type === 'message') {
				addMessage(json.data.name, json.data.text, new Date(json.data.time));
			} else {
				console.log("Data format error: ", json);
			}
		} catch (e) {
			console.log("This doesn\'t look like a valid JSON: ", message.data);
			return;
		}
	};

	/**
	 * Send mesage when user presses Enter key
	 * 
	 */
	$('#btn-conn-noti').on('click', function(e) {
		if (notiUserName.val() !== '') {
		   
		   var msg = JSON.stringify({
				name: notiUserName.val(),
				recevier: notiReceiver.val(),
				text: notiMsg.val()
			});
			
			// Send the message as an ordinary text
			connection.send(msg);
			notiStatus.text("Your data is sent to " +  notiReceiver.val());
		}
	});

	/**
	 *  Add message to the notification/event block
	 *  
	 *  @params String, String, String, String 
	 */
	function addMessage(name, message, dt) {
		var content = '<div class="noti-content">' + 
							'<div> You have a message from : <span class="noti-username">' + name + '</span></div>' + 
							'<div class="noti-message">' + message + '</div>' + 
							'<div class="noti-time">' + dt.toLocaleTimeString() + '</div>' + 
						'</div>';
		notiContent.prepend(content);				
	}
});
