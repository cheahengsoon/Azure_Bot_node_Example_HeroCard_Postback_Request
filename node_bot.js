//loading modules
var express = require("express");
var restify = require("restify");
var botbuilder = require("botbuilder");
var request = require("request-promise");

//load environment variables here
const MSFT_APP_ID = process.env.MSFT_APP_ID;
const MSFT_APP_PW = process.env.MSFT_APP_PW;

//create an express server
var app = express();
app.listen( process.env.PORT || 3000, function(){
	console.log("Express app listening on port: " + process.env.PORT || 3000);
});

//create a chat connector for the bot
var connector = new botbuilder.ChatConnector({
	appId: MSFT_APP_ID,
	appPassword: MSFT_APP_PW
});

//load the botbuilder classes and build a unversal bot using the chat connector
var bot = new botbuilder.UniversalBot(connector);

//hook up bot endpoint
app.post("/messages/receive", connector.listen());

//root dialog
bot.dialog("/", function(session){

		console.log("-------------------------------------------------");
		console.log("Bot Received Message at '/' dialogue endpoint: ");

		//look for the postback
		if(session.message.text === "initiatePostRequest"){
			session.beginDialog("/handle_postback");
		} else {
			//no postback recognized
			session.send("Beep boop. Welcome to the postback bot.");
			//build a hero card and send it
			var msg = new botbuilder.Message(session)
				.textFormat(botbuilder.TextFormat.xml)
				.attachments([
					new botbuilder.HeroCard(session)
						.title("POST Card")
						.subtitle("Sends Postback")
						.text("Click the HeroCard to send a postback and initiate a POST request.")
						.tap(botbuilder.CardAction.postBack(session, "initiatePostRequest"))
				]);
			session.send(msg)
		}
});

//where postback is handled
bot.dialog("/handle_postback", function(session){

	console.log("Postback recognized.");
	session.send("Sending POST request!");

	//send HTTP request
	var options = {
		method: "POST",
		uri: "https://www.thisismyendpoint.com",
		body: {
			some: "data"
		},
		json: true
	}
	request(options)
		.then((response) => {
			//handle response here
		})
		.catch((err) => {
			//handle error here
		});
	
	//go back to root dialog
	session.endDialog();
});
