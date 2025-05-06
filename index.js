const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection, 
  ActivityType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution
  ],
  partials: [
    Partials.Channel, 
    Partials.Message, 
    Partials.User, 
    Partials.GuildMember, 
    Partials.Reaction, 
    Partials.GuildScheduledEvent, 
    Partials.ThreadMember
  ]
});

client.commands = new Collection();
client.config = config;

const commandsPath = path.join(__dirname, 'Commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[✅] Slash command loaded: ${command.data.name}`);
    } else {
      console.log(`[❌] Missing 'data' or 'execute' in command file ${filePath}`);
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    console.log(`[✅] Event loaded: ${event.name}`);
  }
}

client.login(config.token).then(() => {
  console.log('✅ Bot successfully logged in!');
}).catch(error => {
  console.error('❌ Bot login failed:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const prefix = "!"; 

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; 

  if (!message.content.startsWith(prefix)) return; 

  const args = message.content.slice(prefix.length).trim().split(/ +/); 
  const commandName = args.shift().toLowerCase(); 

  if (commandName === 'spotify') {
    try {
      const spotifyCommand = require('./Commands/spotify.js');
      if (spotifyCommand.execute) {
        await spotifyCommand.execute(message, args);
      } else {
        message.reply('The Spotify command is not properly configured.');
      }
      return;
    } catch (error) {
      console.error('Spotify command error:', error);
      message.reply('Error executing Spotify command!');
      return;
    }
  }

  if (commandName === 'reselpanel') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yönetici yetkiniz olmalıdır.');
    }

    try {
      const reselPanelCommand = client.commands.get('reselpanel');
      if (reselPanelCommand) {
        const fakeInteraction = {
          commandName: 'reselpanel',
          options: {
            getString: (name) => args.shift() || null,
            getInteger: (name) => parseInt(args.shift()) || null,
            getBoolean: (name) => args.shift() === 'true',
            getUser: (name) => message.mentions.users.first() || null,
            getChannel: (name) => message.mentions.channels.first() || null,
            getRole: (name) => message.mentions.roles.first() || null,
          },
          reply: async (content) => message.reply(content),
          member: message.member,
          guild: message.guild,
          channel: message.channel,
          user: message.author,
          deferred: false,
          replied: false
        };
        
        await reselPanelCommand.execute(fakeInteraction);
      } else {
        message.reply('Reselpanel komutu bulunamadı. Lütfen yöneticinizle iletişime geçin.');
      }
    } catch (error) {
      console.error('Reselpanel command error:', error);
      message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
    return;
  }

  const command = client.commands.get(commandName);
  if (command) {
    try {
      const fakeInteraction = {
        commandName,
        options: {
          getString: (name) => args.shift() || null,
          getInteger: (name) => parseInt(args.shift()) || null,
          getBoolean: (name) => args.shift() === 'true',
          getUser: (name) => message.mentions.users.first() || null,
          getChannel: (name) => message.mentions.channels.first() || null,
          getRole: (name) => message.mentions.roles.first() || null,
        },
        reply: async (content) => message.reply(content),
        member: message.member,
        guild: message.guild,
        channel: message.channel,
        user: message.author,
        deferred: false,
        replied: false
      };
      
      await command.execute(fakeInteraction);
    } catch (error) {
      console.error(error);
      message.reply("Komut çalıştırılırken bir hata oluştu!");
    }
  }
});
