const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return interaction.reply({
                        content: 'Bu komut bulunamadı veya şu anda çalışmıyor.',
                        ephemeral: true
                    });
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(`Error executing ${interaction.commandName}:`, error);
                    try {
                        if (!interaction.replied) {
                            await interaction.reply({
                                content: 'Bu komutu çalıştırırken bir hata oluştu.',
                                ephemeral: true
                            });
                        }
                    } catch (replyError) {
                        console.error('Error replying to command error:', replyError);
                    }
                }
            } 
            else if (interaction.isButton()) {
                try {
                    if (interaction.customId.startsWith('admin_')) {
                        const command = interaction.client.commands.get('adminpanel');
                        if (command && command.button) {
                            await command.button(interaction);
                        } else {
                            console.error('Admin panel command or button handler not found');
                            await interaction.reply({ content: 'Bu buton artık çalışmıyor.', ephemeral: true });
                        }
                    }
                    else if (interaction.customId.startsWith('reseller_duration_')) {
                        const command = interaction.client.commands.get('reselpanel');
                        if (command && command.button) {
                            await command.button(interaction);
                        } else {
                            console.error('Reseller panel command or button handler not found');
                            await interaction.reply({ content: 'Bu buton artık çalışmıyor.', ephemeral: true });
                        }
                    }
                    else if (interaction.customId === 'add_reseller' || 
                             interaction.customId === 'remove_reseller' || 
                             interaction.customId === 'add_product' || 
                             interaction.customId === 'remove_product' || 
                             interaction.customId === 'add_key' || 
                             interaction.customId === 'remove_key' ||
                             interaction.customId === 'reseller_settings') {
                        const command = interaction.client.commands.get('adminpanel');
                        if (command && command.button) {
                            await command.button(interaction);
                        } else {
                            console.error('Admin panel command or button handler not found');
                            await interaction.reply({ content: 'Bu buton artık çalışmıyor.', ephemeral: true });
                        }
                    }
                    else if (interaction.customId === 'close_ticket') {
                        await interaction.reply({ content: 'Ticket kapatma işlevi henüz uygulanmadı.', ephemeral: true });
                    }
                    else {
                        console.warn(`Unhandled button interaction: ${interaction.customId}`);
                        await interaction.reply({ content: 'Bu buton işlevi tanınmıyor.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('Error handling button interaction:', error);
                    try {
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'Bu butonu işlerken bir hata oluştu.', ephemeral: true });
                        }
                    } catch (replyError) {
                        console.error('Error replying to button error:', replyError);
                    }
                }
            }
            else if (interaction.isStringSelectMenu()) {
                try {
                    if (interaction.customId === 'reseller_product_select') {
                        const command = interaction.client.commands.get('reselpanel');
                        if (command && command.selectMenu) {
                            await command.selectMenu(interaction);
                        } else {
                            console.error('Reseller panel command or selectMenu handler not found');
                            await interaction.reply({ content: 'Bu menü artık çalışmıyor.', ephemeral: true });
                        }
                    } else {
                        console.warn(`Unhandled select menu interaction: ${interaction.customId}`);
                        await interaction.reply({ content: 'Bu menü işlevi tanınmıyor.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('Error handling select menu interaction:', error);
                    try {
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'Bu menüyü işlerken bir hata oluştu.', ephemeral: true });
                        }
                    } catch (replyError) {
                        console.error('Error replying to select menu error:', replyError);
                    }
                }
            }
            else if (interaction.isModalSubmit()) {
                try {
                    if (interaction.customId.includes('_modal')) {
                        if (interaction.customId.startsWith('add_product_modal') || 
                            interaction.customId.startsWith('remove_product_modal') ||
                            interaction.customId.startsWith('add_key_modal') ||
                            interaction.customId.startsWith('remove_key_modal') ||
                            interaction.customId.startsWith('add_reseller_modal') ||
                            interaction.customId.startsWith('remove_reseller_modal')) {
                            
                            const command = interaction.client.commands.get('adminpanel');
                            if (command && command.modal) {
                                await command.modal(interaction);
                            } else {
                                console.error('Admin panel command or modal handler not found');
                                await interaction.reply({ content: 'Bu form artık çalışmıyor.', ephemeral: true });
                            }
                        }
                        else if (interaction.customId === 'request_modal') {
                            await interaction.reply({ content: 'İstek formu işlevi henüz uygulanmadı.', ephemeral: true });
                        }
                        else {
                            console.warn(`Unhandled modal submit interaction: ${interaction.customId}`);
                            await interaction.reply({ content: 'Bu form işlevi tanınmıyor.', ephemeral: true });
                        }
                    } else {
                        console.warn(`Unknown modal interaction: ${interaction.customId}`);
                        await interaction.reply({ content: 'Bu form artık çalışmıyor.', ephemeral: true });
                    }
                } catch (error) {
                    console.error('Error handling modal submit interaction:', error);
                    try {
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'Bu formu işlerken bir hata oluştu.', ephemeral: true });
                        }
                    } catch (replyError) {
                        console.error('Error replying to modal submit error:', replyError);
                    }
                }
            }
        } catch (error) {
            console.error('Global interaction error:', error);
        }
    },
}; 