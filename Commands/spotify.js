
const { AttachmentBuilder, EmbedBuilder, ActivityType, PermissionsBitField } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const config = require('../config.json');
const path = require('path');
const fs = require('fs');


const SAFE_FONT = 'sans-serif';


const FOOTER_TEXT = config.spotify?.footerText || "CodeJS Community";
const REQUIRE_ROLE = config.spotify?.requireRole || false;
const ROLE_ID = config.spotify?.roleId || "";
const PREFIX = config.prefix || "!";

const DELETE_DURATION = config.spotify?.deleteDuration || 0; 


const originalConsoleError = console.error;
console.error = function(message, ...args) {
    if (typeof message === 'string' && message.includes('IDWriteFontFamily')) {
        return; 
    }
    
    originalConsoleError(message, ...args);
};

module.exports = {
    name: 'spotify',
    description: 'Shows the current Spotify track a user is listening to in a stylish format',
    prefixCommand: true,
    
    async execute(message, args) {
        try {
            
            if (REQUIRE_ROLE && ROLE_ID) {
                const hasRole = message.member.roles.cache.has(ROLE_ID);
                if (!hasRole) {
                    return message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`Bu komutu kullanabilmek için gerekli role sahip değilsiniz.`)
                                .setColor('#1DB954')
                        ]
                    });
                }
            }
            
            
            const targetUser = message.author;
            const member = message.guild.members.cache.get(targetUser.id);
            
            
            const spotifyActivity = member.presence?.activities.find(
                activity => activity.type === ActivityType.Listening && activity.name === 'Spotify'
            );
            
            if (!spotifyActivity) {
                
                return message.reply(`${targetUser.username} şu anda Spotify dinlemiyor.`);
            }
            
            
            const { details: songName, state: artistName, assets, timestamps } = spotifyActivity;
            const albumArtURL = `https://i.scdn.co/image/${assets.largeImage.slice(8)}`;
            
            
            const startTime = timestamps.start;
            const endTime = timestamps.end;
            const currentTime = Date.now();
            
            const playbackDuration = endTime - startTime;
            const playbackProgress = currentTime - startTime;
            
            const formatTime = (ms) => {
                const seconds = Math.floor((ms / 1000) % 60);
                const minutes = Math.floor((ms / 1000 / 60) % 60);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            };
            
            const currentPlaybackTime = formatTime(playbackProgress);
            const totalDuration = formatTime(playbackDuration);
            
            
            
            const canvas = createCanvas(1000, 500);
            const ctx = canvas.getContext('2d');
            
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            try {
                
                const albumArt = await loadImage(albumArtURL);
                const avatar = await loadImage(targetUser.displayAvatarURL({ extension: 'png', size: 512 }));
                
                
                const SPOTIFY_GREEN = '#1DB954';
                const CODE_JS_BLUE = '#00A8FF';
                const BLACK = '#000000';
                const DARK_GRAY = '#111111';
                const LIGHTNING_BLUE = '#72A8FE';
                const WHITE = '#FFFFFF';
                const LIGHT_GREY = '#AAAAAA';
                
                
                function roundRect(x, y, width, height, radius) {
                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + width - radius, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                    ctx.lineTo(x + width, y + height - radius);
                    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                    ctx.lineTo(x + radius, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                }
                
                
                const panelWidth = 920;  
                const panelHeight = 420; 
                const panelX = (canvas.width - panelWidth) / 2;
                const panelY = (canvas.height - panelHeight) / 2;
                
                
                ctx.save();
                roundRect(panelX, panelY, panelWidth, panelHeight, 20);
                ctx.clip();
                ctx.fillStyle = BLACK;
                ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
                
                
                function drawLightning(startX, startY, length, angle, width, generations) {
                    if (generations <= 0) return;
                    
                    const endX = startX + Math.cos(angle) * length;
                    const endY = startY + Math.sin(angle) * length;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    
                    
                    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.5, 'rgba(114, 168, 254, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = width;
                    ctx.shadowColor = LIGHTNING_BLUE;
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    
                    if (Math.random() < 0.5 && generations > 1) {
                        const branchAngle = angle + (Math.random() * 1 - 0.5);
                        drawLightning(
                            startX + Math.cos(angle) * (length * 0.3),
                            startY + Math.sin(angle) * (length * 0.3),
                            length * 0.6,
                            branchAngle,
                            width * 0.7,
                            generations - 1
                        );
                    }
                    
                    
                    if (length > 30) {
                        drawLightning(
                            endX,
                            endY,
                            length * 0.8,
                            angle + (Math.random() * 0.4 - 0.2),
                            width * 0.9,
                            generations - 1
                        );
                    }
                }
                
                
                for (let i = 0; i < 5; i++) {
                    const startX = panelX + Math.random() * panelWidth;
                    const startY = panelY;
                    const angle = Math.PI / 2 + (Math.random() * 0.4 - 0.2); 
                    
                    drawLightning(
                        startX,
                        startY,
                        70 + Math.random() * 150,
                        angle,
                        2 + Math.random() * 2,
                        3
                    );
                }
                
                
                ctx.fillStyle = 'rgba(114, 168, 254, 0.05)';
                ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
                
                
                const leftSectionWidth = panelWidth * 0.45;
                const rightSectionWidth = panelWidth * 0.45;
                const leftSectionX = panelX + 30;
                const rightSectionX = panelX + panelWidth - rightSectionWidth - 30;
                const sectionY = panelY + 30;
                const sectionHeight = panelHeight - 60;
                
                
                ctx.fillStyle = 'rgba(10, 10, 10, 0.6)';
                roundRect(leftSectionX, sectionY, leftSectionWidth, sectionHeight, 15);
                ctx.fill();
                roundRect(rightSectionX, sectionY, rightSectionWidth, sectionHeight, 15);
                ctx.fill();
                
                
                
                const albumSize = 200; 
                const albumX = leftSectionX + 20;
                const albumY = sectionY + 30;
                
                
                ctx.shadowColor = CODE_JS_BLUE;
                ctx.shadowBlur = 20; 
                roundRect(albumX, albumY, albumSize, albumSize, 10);
                ctx.fillStyle = BLACK;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                
                ctx.save();
                roundRect(albumX, albumY, albumSize, albumSize, 10);
                ctx.clip();
                ctx.drawImage(albumArt, albumX, albumY, albumSize, albumSize);
                ctx.restore();
                
                
                const songInfoX = albumX + albumSize + 20;
                const songInfoY = albumY + 20;
                const songInfoWidth = leftSectionWidth - albumSize - 40;
                
                
                ctx.fillStyle = CODE_JS_BLUE;
                ctx.font = `bold 22px ${SAFE_FONT}`; 
                ctx.textAlign = 'left';
                ctx.fillText('SPOTIFY', songInfoX, songInfoY);
                
                
                ctx.font = `bold 26px ${SAFE_FONT}`; 
                ctx.fillStyle = WHITE;
                
                const titleY = songInfoY + 45; 
                let titleText = songName;
                const titleMetrics = ctx.measureText(titleText);
                
                if (titleMetrics.width > songInfoWidth) {
                    while (ctx.measureText(titleText + '...').width > songInfoWidth && titleText.length > 0) {
                        titleText = titleText.slice(0, -1);
                    }
                    titleText += '...';
                }
                
                ctx.fillText(titleText, songInfoX, titleY);
                
                
                ctx.font = `22px ${SAFE_FONT}`; 
                ctx.fillStyle = LIGHT_GREY;
                ctx.fillText(artistName, songInfoX, titleY + 35); 
                
                
                const barWidth = leftSectionWidth - 40;
                const barHeight = 4;
                const barX = leftSectionX + 20;
                const barY = sectionY + sectionHeight - 50;
                
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                roundRect(barX, barY, barWidth, barHeight, 2);
                ctx.fill();
                
                
                const progressWidth = barWidth * (playbackProgress / playbackDuration);
                const progressGradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
                progressGradient.addColorStop(0, CODE_JS_BLUE);
                progressGradient.addColorStop(1, LIGHTNING_BLUE);
                
                ctx.fillStyle = progressGradient;
                ctx.shadowColor = CODE_JS_BLUE;
                ctx.shadowBlur = 10;
                roundRect(barX, barY, progressWidth, barHeight, 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                
                ctx.font = `14px ${SAFE_FONT}`;
                ctx.fillStyle = LIGHT_GREY;
                ctx.textAlign = 'left';
                ctx.fillText(currentPlaybackTime, barX, barY + 20);
                
                ctx.textAlign = 'right';
                ctx.fillText(totalDuration, barX + barWidth, barY + 20);
                
                
                
                const avatarSize = 160; 
                const avatarX = rightSectionX + rightSectionWidth/2;
                const avatarY = sectionY + 100; 
                
                
                ctx.beginPath();
                const glowRadius = avatarSize/2 + 15;
                const glowGradient = ctx.createRadialGradient(
                    avatarX, avatarY, avatarSize/2 - 10,
                    avatarX, avatarY, glowRadius
                );
                glowGradient.addColorStop(0, 'rgba(114, 168, 254, 0)');
                glowGradient.addColorStop(0.7, 'rgba(114, 168, 254, 0.1)');
                glowGradient.addColorStop(1, 'rgba(114, 168, 254, 0)');
                
                ctx.fillStyle = glowGradient;
                ctx.arc(avatarX, avatarY, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                
                for (let i = 0; i < 360; i += 15) {
                    if (Math.random() < 0.7) { 
                        const angle = i * Math.PI / 180;
                        const rayLength = 5 + Math.random() * 15;
                        const innerRadius = avatarSize/2 + 2;
                        const outerRadius = innerRadius + rayLength;
                        
                        const startX = avatarX + innerRadius * Math.cos(angle);
                        const startY = avatarY + innerRadius * Math.sin(angle);
                        const endX = avatarX + outerRadius * Math.cos(angle);
                        const endY = avatarY + outerRadius * Math.sin(angle);
                        
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = `rgba(114, 168, 254, ${0.2 + Math.random() * 0.3})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
                
                
                ctx.beginPath();
                ctx.arc(avatarX, avatarY, avatarSize/2 + 2, 0, Math.PI * 2);
                ctx.strokeStyle = LIGHTNING_BLUE;
                ctx.lineWidth = 2;
                ctx.shadowColor = LIGHTNING_BLUE;
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                
                ctx.save();
                ctx.beginPath();
                ctx.arc(avatarX, avatarY, avatarSize/2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(avatar, avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize);
                ctx.restore();
                
                
                const usernameY = avatarY + avatarSize/2 + 50; 
                ctx.font = `bold 26px ${SAFE_FONT}`; 
                ctx.textAlign = 'center';
                
                
                ctx.shadowColor = LIGHTNING_BLUE;
                ctx.shadowBlur = 10;
                ctx.fillStyle = WHITE;
                ctx.fillText(targetUser.username, avatarX, usernameY);
                ctx.shadowBlur = 0;
                
                
                const spotifyTextY = usernameY + 30; 
                ctx.font = `18px ${SAFE_FONT}`;  
                ctx.textAlign = 'center';  
                ctx.fillStyle = CODE_JS_BLUE;
                ctx.fillText('Listening to Spotify', avatarX, spotifyTextY);
                
                
                const nameWidth = ctx.measureText(targetUser.username).width;
                const lineY = usernameY + 5;
                
                ctx.beginPath();
                ctx.moveTo(avatarX - nameWidth/2 - 10, lineY);
                ctx.lineTo(avatarX + nameWidth/2 + 10, lineY);
                ctx.strokeStyle = `rgba(114, 168, 254, 0.3)`;
                ctx.lineWidth = 1;
                ctx.shadowColor = LIGHTNING_BLUE;
                ctx.shadowBlur = 5;
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                
                function drawZigzagLine(startX, startY, endX, endY, segments, amplitude) {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    
                    const dx = (endX - startX) / segments;
                    const dy = (endY - startY) / segments;
                    
                    for (let i = 1; i <= segments; i++) {
                        const x = startX + dx * i;
                        const y = startY + dy * i;
                        
                        
                        const angle = Math.atan2(endY - startY, endX - startX) + Math.PI/2;
                        const offset = (Math.random() * 2 - 1) * amplitude;
                        const offsetX = Math.cos(angle) * offset;
                        const offsetY = Math.sin(angle) * offset;
                        
                        ctx.lineTo(x + offsetX, y + offsetY);
                    }
                    
                    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
                    gradient.addColorStop(0.5, 'rgba(114, 168, 254, 0.5)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1;
                    ctx.shadowColor = LIGHTNING_BLUE;
                    ctx.shadowBlur = 8;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
                
                
                ctx.globalAlpha = 0.5;
                drawZigzagLine(
                    albumX + albumSize, 
                    albumY + albumSize/2,
                    avatarX - avatarSize/2,
                    avatarY,
                    5, 
                    20
                );
                ctx.globalAlpha = 1.0;
                
                
                const communityTextX = leftSectionX + leftSectionWidth/2; 
                const communityTextY = sectionY + sectionHeight - 20; 
                
                
                ctx.font = `bold 22px ${SAFE_FONT}`; 
                ctx.textAlign = 'center'; 
                ctx.fillStyle = CODE_JS_BLUE;
                ctx.shadowColor = LIGHTNING_BLUE;
                ctx.shadowBlur = 7; 
                ctx.fillText(FOOTER_TEXT, communityTextX, communityTextY);
                ctx.shadowBlur = 0;
                
            } catch (err) {
                console.error('Error with canvas rendering:', err);
            }
            
            
            const buffer = canvas.toBuffer();
            const attachment = new AttachmentBuilder(buffer, { name: 'spotify-status.png' });
            
            const sentMessage = await message.reply({ files: [attachment] });
            
            
            if (DELETE_DURATION > 0) {
                setTimeout(() => {
                    try {
                        sentMessage.delete().catch(e => console.error('Message delete error:', e));
                    } catch (error) {
                    }
                }, DELETE_DURATION);
            }
            
        } catch (error) {
            console.error('Error executing spotify command:', error);
            await message.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            });
        }
    }
}; 
