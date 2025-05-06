const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`⚙️ ${client.user.tag} olarak giriş yapıldı!`);

    const config = client.config;

    if (config && config.status) {
      try {
        const activity = {
          name: config.status.name || 'fxipremium',
          type: ActivityType.Playing
        };

        client.user.setActivity(activity);
        console.log(`✅ Bot durumu ayarlandı: ${activity.type} ${activity.name}`);
      } catch (error) {
        console.error('❌ Bot durumu ayarlanırken bir hata oluştu:', error);
      }
    }

    console.log(`✅ Bot ${client.guilds.cache.size} sunucuda hazır!`);
    console.log('-------------------');
  }
};
