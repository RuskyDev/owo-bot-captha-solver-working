const imageToBase64 = require('image-to-base64');
const Anticaptcha = require('anticaptcha2');
const discord = require('discord.js-selfbot');

const anticaptcha = new Anticaptcha('ENTER-YOUR-ANTICAPTCHA-KEY-HERE');
const client = new discord.Client();

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

client.on("ready", async () => {
  const balance = await anticaptcha.getBalance();
  console.log(`${client.user.tag}, Bring it on!\nCredits: ${balance}`);
});

client.on("message", async (message) => {
  if (message.author.id === "408785106942164992") {
    if (message.content.includes("Are you a real human?")) {
      const lastMessageId = message.author.lastMessageID;
      const lastMessage = await message.channel.messages.fetch(lastMessageId);
      const attachments = lastMessage.attachments.array();
      
      if (attachments.length > 0) {
        const attachmentUrl = attachments[0].url;
        const base64 = await imageToBase64(attachmentUrl);
        const captcha = new Anticaptcha.ImageToTextTask({
          body: base64,
          phrase: false,
          case: true,
          numeric: 0,
          math: false,
          length: [5, 5]
        });

        const solvedCaptcha = await anticaptcha.solve(captcha);
        
        message.channel.send(solvedCaptcha.text)
          .then(() => {
            message.channel.awaitMessages(response => response.content.includes("I have verified that you are human"), {
              max: 1,
              time: 30000,
              errors: ['time'],
            })
            .then(() => {
              console.log("Success");
            })
            .catch(() => {
              console.log("Failed");
            });
          });
      }
    }
  }
});

client.login("ENTER-YOUR-DISCORD-TOKEN");
