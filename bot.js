console.log("Hey! This is PrashantBot!");
require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const fetch = require("node-fetch");
const querystring = require("querystring");
const request = require("request");
const PREFIX = "$";
//Make the bot Online
client.on("ready", () => console.log("Connected"));

client.on("message", async (message) => {
  //

  if (message.author.bot) return;

  const msg = message.content;
  const regex = /^[^-!0-9\n\s]*$/;

  //Among Us Code sent then send Upu is the imposter !
  if (msg.length === 6 && msg.match(regex)) {
    message.channel.send("UPU Imposter ho!!!");
  }
  if (message.content.startsWith(PREFIX)) {
    //Store Command in a var and arguments in an array
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === "define") {
      if (!args.length)
        return message.channel.send("You need to provide a search query!!!");
      // message.reply('DEFINE COMMAND INVOKED');
      const query = querystring.stringify({ term: args.join(" ") });
      const { list } = await fetch(
        `https://api.urbandictionary.com/v0/define?${query}`
      ).then((response) => response.json());
      if (!list.length) {
        return message.channel.send(
          `No results found for **${args.join(" ")}**.`
        );
      }
      const trim = (str, max) =>
        str.length > max ? `${str.slice(0, max - 3)}...` : str;

      const [answer] = list;

      const embed = new Discord.MessageEmbed()
        .setColor("#eb4034")
        .setTitle(answer.word.concat("\u200b"))
        .setURL(answer.permalink.concat("\u200b"))
        .addFields(
          {
            name: "Definition",
            value: trim(answer.definition.concat("\u200b"), 1024),
          },
          {
            name: "Example",
            value: trim(answer.example.concat("\u200b"), 1024),
          },
          {
            name: "Rating",
            value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.`,
          }
        );
      message.channel.send(embed);
    } else if (CMD_NAME === "joke") {
      const options = {
        url: "https://api.reddit.com/r/jokes",
        headers: {
          "User-Agent": "my bot 1.0",
        },
      };

      function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          const info = JSON.parse(body);
          const newdata = info.data.children;

          //Generate random jokes each time
          const r = Math.floor(Math.random() * newdata.length);

          const title = newdata[r]["data"]["title"];
          const joke = newdata[r]["data"]["selftext"];
          const url = newdata[r]["data"]["url"];

          //Embed the msg in a div like box
          const embed = new Discord.MessageEmbed()
            .setColor("#EFFF00")
            .setTitle("A Random Joke")
            .setURL(url)
            .addFields(
              { name: "\u200b", value: title },
              { name: "\u200b", value: joke }
            );

          message.channel.send(embed);
        } else {
          message.channel.send("An Error occured. Please Try Again later!");
        }
      }
      request(options, callback);
    }
    //Send list of commands for the bot
    else if (CMD_NAME === "commands" || CMD_NAME === "command") {
      const embed = new Discord.MessageEmbed()
        .setColor("#058ba7")
        .setTitle("List of Commands")
        .addFields(
          { name: "$define [word]", value: "Defines the given [word] " },
          { name: "$joke", value: "Sends a random joke" },
          {
            name: "$meme [opt:dank (d),wholesome(w)]",
            value:
              "dank or d : sends a dank meme \n wholesome or w : sends a wholesome meme",
          }
        );

      message.channel.send(embed);
    }

    //Send a dank or a wholesome meme
    else if (CMD_NAME === "meme" || CMD_NAME === "memes") {
      if (!args.length) {
        memeGrabber();
      } else if (args[0] === "dank" || args[0] === "d") {
        //send dank meme
        memeGrabber("lmGoingToHellForThis");
      } else if (args[0] === "wholesome" || args[0] === "w") {
        //send a wholesome meme
        memeGrabber("wholesomememes");
      } else {
        message.channel.send(
          "Invalid meme type!!! \nCheck $command for the list of arguments"
        );
      }
    }
  }
  function memeGrabber(type = null) {
    //For a simple meme
    if (type == null) {
      type = "memes";
    }
    //Grab from the Reddit API

    const options = {
      url: "https://api.reddit.com/r/" + type + "/hot",
      headers: {
        "User-Agent": "my bot 1.0",
      },
    };

    //Request the API
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        const newdata = info.data.children;

        //Generate random jokes each time
        r = Math.floor(Math.random() * newdata.length);
        const title = newdata[r]["data"]["title"];

        //FIX IF THIS VALUE WILL BE NULL
        do {
          url = newdata[r]["data"]["url_overridden_by_dest"];
        } while (url == null);
        message.channel.send(title, {
          files: [url],
        });
      } else {
        message.channel.send("An Error occured. Please Try Again later!");
      }
    }
    request(options, callback);

    // message.channel.send(type + "meme invoked");
  }
});
client.login(process.env.API_KEY);
