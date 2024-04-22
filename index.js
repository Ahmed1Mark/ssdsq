const { Client, Intents, MessageButton, IntentsBitField, DiscordAPIError, MessageSelectMenu, MessageAttachment, MessageEmbed, MessageActionRow } = require('discord.js');
const { loadImage, Canvas} = require("canvas-constructor/cairo")
const { version } = require("discord.js")
const Keyv = require('keyv');
const { inviteTracker } = require("discord-inviter");
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const moment = require('moment');
require("moment-duration-format");
const db = new Keyv('sqlite://./storage/database.sqlite');
const express = require('express');
const app = express();
const path = require("path");

const {
    token,
    prefix,
    channelID: channelIdToJoin,
    mp3File,
    timeout,
} = require('./config.json')

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
// يمكنك استخدام mergedConfig في الشيفرة الخاصة بك الآن

let canvax = require('canvas')
canvax.registerFont("./storage/Uni Sans Heavy.otf", { family: 'Discord' })
canvax.registerFont("./storage/DejaVuSansCondensed-Bold.ttf", { family: 'Discordx' })
const client = new Client({
intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.MESSAGE_CONTENT
],
}); // Declare client to be a new Discord Client (bot)
require('http').createServer((req, res) => res.end(`
Dveloper Bot : Ahmed Clipper
Server Support : https://dsc.gg/clipper-tv
`)).listen(3000) //Dont remove this 
  /*
  Code Below provides info about the bot 
  once it's ready
  */

//voice support
const mp3FilePath = path.resolve(mp3File);
const lastInteractions = new Map();
const usersInVoiceChannel = new Set();
const playingInChannel = new Map();
let isPlaying = false;
async function joinVoiceChannelAndPlay(channel) {
  try {
    if (!channel || channel.type !== "GUILD_VOICE") {
      console.error(
        "Invalid voice channel or the bot cannot find the channel.",
      );
      return null;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    return connection;
  } catch (error) {
    console.error(error);
    return null;
  }
}

client.once("ready", async () => {
  // هنا يمكنك الاستعانة بقائمة الأعضاء في القناة الصوتية لمراقبة مدى وجود البوت في القناة
  const usersInVoiceChannel = new Set();

  const channel = client.channels.cache.get(channelIdToJoin);
  if (channel && channel.type === "GUILD_VOICE") {
    // التحقق مما إذا كان البوت متصلًا بالفعل بالقناة
    if (!channel.members.has(client.user.id)) {
      const connection = await joinVoiceChannelAndPlay(channel);
      if (connection) {
        const player = createAudioPlayer();
        connection.subscribe(player);
        const resource = createAudioResource(fs.createReadStream(mp3FilePath));
        player.play(resource);
      }
    }
  } else {
    console.error("Invalid voice channel ID or the bot cannot find the channel.");
  }

  client.on("voiceStateUpdate", async (oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (newState.member.user.bot) {
      return;
    }

    if (newChannel && newChannel.id === channelIdToJoin) {
      // هنا يمكنك إدارة التفاعل مع دخول الأعضاء للقناة الصوتية
    }

    if (oldState.channel && oldState.channel.id === channelIdToJoin && !newState.channel) {
      // هنا يمكنك إدارة التفاعل مع خروج الأعضاء من القناة الصوتية
    }
  });
});

client.once("ready", async () => {
const playingInChannel = new Map();
let isPlaying = false;
client.on("voiceStateUpdate", async (oldState, newState) => {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (newState.member.user.bot) {
        return;
    }

    // تحقق مما إذا كان العضو الجديد دخل قناة صوتية

    if (newChannel && newChannel.id === channelIdToJoin) {
    if (!playingInChannel.has(newChannel.id)) {
        playingInChannel.set(newChannel.id, { playing: false, position: 0 }); // تخزين حالة التشغيل ونقطة التوقف
    }

    const { playing, position } = playingInChannel.get(newChannel.id);

    if (!playing) {
        const connection = await joinVoiceChannelAndPlay(newChannel);
        if (connection) {
            const player = createAudioPlayer();
            connection.subscribe(player);
            let resource;
            if (position > 0) {
                // إعادة التشغيل من نقطة التوقف إذا كان هناك
                resource = createAudioResource(fs.createReadStream(mp3FilePath), { seek: position });
            } else {
                resource = createAudioResource(fs.createReadStream(mp3FilePath));
            }
            player.play(resource);
            playingInChannel.set(newChannel.id, { playing: true, position: position });
        }
    }
}

    // تحقق مما إذا غادر العضو القناة الصوتية
    if (oldState.channel && oldState.channel.id === channelIdToJoin && !newState.channel) {
        // إذا كان العضو الذي غادر هو العضو الأخير في القناة، قم بوقف تشغيل الملف الصوتي
        if (oldState.channel.members.size === 1) {
            playingInChannel.set(oldState.channel.id, false);
            if (client.voice && client.voice.connections) {
                client.voice.connections.forEach((connection) => {
                    if (connection.channel.id === oldState.channel.id) {
                        connection.disconnect();
                    }
                });
            }
        }
    }
});
});

const { EventEmitter } = require('events');
EventEmitter.defaultMaxListeners = 30; // أو أي قيمة تعتقد أنها مناسبة

let tracker = "10";

require("events").EventEmitter.defaultMaxListeners = 30;
  tracker = new inviteTracker(client);
	// "guildMemberAdd"  event to get full invite data
tracker.on("guildMemberAdd", async (member, inviter, invite, error) => {
  const startTimestamp = Math.floor(Date.now() / 1000) - 28;
  const memberCount = member.guild.memberCount;
  // return when get error
  if(error) return console.error(error);
  // get the channel
  let channel = member.guild.channels.cache.get("1230784484257959936"),
    Msg = (`
1. ${member.user} **- تم دعوة شخص جديد للسيرفر**
2. <@!${inviter.id}> **- تمت دعوته من قبل**
3. **عدد الدعوات -** **__${invite.count}__**
4. **العضو رقم -** **__${memberCount}__**
5. **<t:${startTimestamp}:R> -** **انضم للسيرفر منذ**`);
  // change welcome message when the member is bot
  if (member.user.bot)
        Msg = (`
1. ${member.user} **- تم دعوة بوت جديد جديد للسيرفر**
2. <@!${inviter.id}> **- تمت دعوته من قبل**
3. **عدد الدعوات -** **__${invite.count}__**
4. **العضو رقم -** **__${memberCount}__**
5. **<t:${startTimestamp}:R> -** **انضم للسيرفر منذ**`);
  // send welcome message
  channel.send(Msg);
});
//Fix Erorr Project
process.on("uncaughtException" , err => {
return;
})
 
process.on("unhandledRejection" , err => {
return;
})
 
process.on("rejectionHandled", error => {
  return;
});
client.on('ready', () => {
  console.log(``);
  console.log(`</> Logged in as : ${client.user.tag}!`);
  console.log(`</> Servers : ${client.guilds.cache.size}`);
  console.log(`</> Users : ${client.users.cache.size}`);
  console.log(`</> channels : ${client.channels.cache.size}`);
  console.log(`</> Name : ${client.user.username}`);
  client.user.setStatus('idle');///dnd/online/idle
  let status = [`By : Ahmed Clipper`];
  setInterval(()=>{
  client.user.setActivity(status[Math.floor(Math.random()*status.length)]);
  },5000)
})



let nextAzkarIndex = 0;

client.on("messageCreate", async (black) => {
    if (black.content.startsWith(prefix + "ping")) {
        black.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`> ⚙ **Please Wait...**`)
            ]
        }).then((m) => {
            setTimeout(() => {
                m.edit({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> \`-\` **My Ping Is :** \`${client.ws.ping}\``)
                            .setTimestamp()
                    ]
                });
            }, 5000);
        });
    }
});



/////////////////////////////////



// زيادة الحد الأقصى لعدد مستمعي الأحداث لعميل Discord
client.setMaxListeners(30); // تعيين العدد الذي ترغب فيه للحد الأقصى




let ticketOpenerId;


client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ticketpanel') {
const ticketOpenerId = message.author.id;   
const selectMenuOptions = [
    {
        label: 'Buy Robux',
        value: 'ticket_1',
        description: 'Buy Robux In Roblox Game.',
        emoji: '<:G7:1151244037517488159>'
    },
    {
        label: 'Buy UC For PUBG MOBILE',
        value: 'ticket_2',
        description: 'Buy UC in PUBG Mobile Game.',
        emoji: '<:pubgmobile:1102769748518916146>'
    },
    {
        label: 'Buy Project Bot Discord',
        value: 'ticket_3',
        description: 'Purchase Bot Projects Or Code.',
        emoji: '<:921703781027184660:1089615608154431579>'
    },
    {
        label: 'Photoshop Designer',
        value: 'ticket_4',
        description: 'Creating Designs Or Backgrounds',
        emoji: '🖼'
    },
    {
        label: 'Editing Discord Server',
        value: 'ticket_5',
        description: 'Modifying Organizing Discord Servers.',
        emoji: '📈'
    },
    {
        label: 'Support Team',
        value: 'ticket_6',
        description: 'Talk To The Management Staff',
        emoji: '<:911751899324239902:1089615602471141416>'
    },
  /*/
    {
        label: 'تقديم صانع محتوى',
        value: 'ticket_7',
        description: 'تقديم طلب صانع محتوى',
        emoji: '♾️'
    },
    {
        label: 'المواقع',
        value: 'ticket_8',
        description: 'للإبلاغ عن مشكلة في الموقع',
        emoji: '🌐'
    },
    {
        label: 'وزارة الداخلية',
        value: 'ticket_9',
        description: 'قسم الشؤون الداخلية',
        emoji: '👮‍♀️'
    },
    {
        label: 'وزارة الصحة والسكان',
        value: 'ticket_10',
        description: 'قسم الصحة والسكان',
        emoji: '👨‍🔬'
    },
    {
        label: 'وزارة الدفاع',
        value: 'ticket_11',
        description: 'قسم الدفاع والأمان',
        emoji: '💂'
    },
    {
        label: 'شركة السحب والصيانة',
        value: 'ticket_12',
        description: 'قسم الصيانة والدعم الفني',
        emoji: '👨‍🔧'
    }
    /*/
];
        const selectMenu = new MessageSelectMenu()
            .setCustomId('ticket_panel')
            .setPlaceholder('Please Choose The Specialty You Desire')
            .addOptions(selectMenuOptions);

        const row = new MessageActionRow().addComponents(selectMenu);

        const embed = new MessageEmbed()
            .setTitle("<a:3_:1089615585232556204> Welcome To Server __Ra'ad__ Community <a:12:1150947511146664017>")
            .setDescription(`<a:11:1150943009442107523> Please choose the section you want \n<a:11:1150943009442107523> God willing, you will find what you want on the server \n\n <:921703781027184660:1089615608154431579> **Developer BOT <@803873969168973855> <:911751899324239902:1089615602471141416>**`);

        message.channel.send({ embeds: [embed], components: [row] });
    }
});



// Counter for ticket numbers
let ticketCounter = 1;
const userTickets = new Map();

// Define a set to store roles with permission to claim
const claimPermissions = new Set();

// Function to check if a member has permission to claim
function hasClaimPermission(member) {
    return member.roles.cache.some(role => claimPermissions.has(role.id));
}

// Add roles with permission to claim
// Replace 'role_id_1', 'role_id_2', etc. with the actual role IDs
claimPermissions.add('1218308274852728932');
claimPermissions.add('1218349464817897533');
claimPermissions.add('1223814666958934096');
claimPermissions.add('1223814667638407299');
claimPermissions.add('1224346531310604399');
claimPermissions.add('1224349559006826616');
claimPermissions.add('1224346550080241817');
claimPermissions.add('1224349445781586112');
claimPermissions.add('1223814666543697971');
claimPermissions.add('1223814665356705823');
claimPermissions.add('1218325891361538201');
claimPermissions.add('1218333911839543316');
claimPermissions.add('1218613841785782413');
claimPermissions.add('1218348609926332516');
// Add more roles as needed

// Map to store user ticket count

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu() && !interaction.isButton()) return;

    const { member, guild } = interaction;
  
  
if (interaction.customId === 'addmem_kikmem') {
      if (!hasClaimPermission(member)) {
        await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
        return;
    }
    // إرسال رسالة لتأكيد الإغلاق
    await interaction.reply({ content: 'Determine the required action', ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton().setCustomId('remove_member').setLabel('Remove a person').setStyle('DANGER'),
                new MessageButton().setCustomId('add_member').setLabel('Add a person').setStyle('SECONDARY')
            )
        ]
    });
}


if (interaction.customId === 'msg_control') {
      if (!hasClaimPermission(member)) {
        await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
        return;
    }
    // إرسال رسالة لتأكيد الإغلاق
    await interaction.reply({ content: 'Determine the required action', ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton().setCustomId('msgdeleted').setLabel('Delete message').setStyle('DANGER'),
                new MessageButton().setCustomId('sendmsgpost').setLabel('Send a regular message').setStyle('SECONDARY'),
                new MessageButton().setCustomId('sendmsgembed').setLabel('Send a message with Embed').setStyle('SECONDARY')
            )
        ]
    });
}
 

if (interaction.customId === 'msg_sendcontrol') {
      if (!hasClaimPermission(member)) {
        await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
        return;
    }
    // إرسال رسالة لتأكيد الإغلاق
    await interaction.reply({ content: 'Determine the required action', ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton().setCustomId('sendowntick').setLabel('Send a message to the ticket owner').setStyle('SECONDARY'),
                new MessageButton().setCustomId('sendmemberid').setLabel('Send a message to a specific user').setStyle('SECONDARY')
            )
        ]
    });
}
  

if (interaction.customId === 'sendmemberid') {
    if (!hasClaimPermission(member)) {
        await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
        return;
    }
    
    // طلب إدخال ID الشخص
    await interaction.reply({ content: 'Under maintenance and testing', ephemeral: true });

    const filter = (response) => response.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 }); // المستخدم لديه دقيقة واحدة للرد

    collector.on('collect', async (msg) => {
        const recipientId = msg.content;

        // طلب إدخال نص الرسالة
        await interaction.followUp({ content: 'Enter the text you want to send to the person', ephemeral: true });

        const messageCollector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        messageCollector.on('collect', async (message) => {
            const textToSend = message.content;

            // هنا يمكنك إجراء أي إجراء آخر مثل إرسال الرسالة للمستخدم المحدد
            await interaction.followUp({ content: `You will send the message "${textToSend}" For the user with the ID ${recipientId}`, ephemeral: true });
        });

        messageCollector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.followUp({ content: 'No timely response was provided.', ephemeral: true });
            }
        });
    });

    collector.on('end', async (collected) => {
        if (collected.size === 0) {
            await interaction.followUp({ content: 'No timely response was provided.', ephemeral: true });
        }
    });
}


if (interaction.customId === 'sendmsgembed') {
    // قم بتنفيذ الإجراء المرتبط بإرسال رسالة بـ أمبيد
    const msg = await interaction.reply({ content: 'Enter the speech to send the message using Embed', ephemeral: true });

    // استجابة للرسالة القادمة من المستخدم
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async m => {
        const content = m.content.trim(); // استخراج النص المدخل من المستخدم
        try {
            await sendEmbedMessage(interaction, content); // استدعاء دالة لإرسال الرسالة بـ Embed
            await interaction.deleteReply(); // حذف رسالة الرد الأصلية
            await m.delete(); // حذف رسالة المستخدم
        } catch (error) {
            console.error('An error occurred while trying to send the message with Embed:', error);
            await interaction.followUp({ content: 'An error occurred while trying to send the message with Embed', ephemeral: true });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.followUp({ content: 'The text was not provided to send the message to Ambed in time', ephemeral: true });
            msg.delete(); // حذف رسالة الطلب الأصلية
        }
    });
}

// دالة لإرسال رسالة بـ Embed
async function sendEmbedMessage(interaction, content) {
    // إنشاء الـ Embed بناءً على النص المستلم
    const embed = {
        description: content,
        color: "#2c2c34", // يمكنك تعيين اللون كما تشاء
    };
    await interaction.channel.send({ embeds: [embed] });
}


if (interaction.customId === 'sendmsgpost') {
    // قم بتنفيذ الإجراء المرتبط بإرسال رسالة عادية
    const msg = await interaction.reply({ content: 'Enter the speech to send the message', ephemeral: true });

    // استجابة للرسالة القادمة من المستخدم
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async m => {
        const content = m.content.trim(); // استخراج النص المدخل من المستخدم
        try {
            await interaction.channel.send({ content: content }); // إرسال الرسالة بالشات ليروها الجميع
            await m.delete(); // حذف رسالة المستخدم
        } catch (error) {
            console.error('An error occurred while trying to send the message:', error);
            await interaction.followUp({ content: 'An error occurred while trying to send the message', ephemeral: true });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.followUp({ content: 'The text was not provided to send the message in time', ephemeral: true });
            msg.delete(); // حذف رسالة الطلب الأصلية
        }
    });
}

// دالة لإرسال رسالة عادية
async function sendMessage(interaction, content) {
    await interaction.followUp({ content: content, ephemeral: true });
}


if (interaction.customId === 'msgdeleted') {
    // قم بتنفيذ الإجراء المرتبط بحذف الرسالة
    await interaction.reply({ content: 'Enter the ID of the message you want to delete', ephemeral: true });

    // استجابة للرسالة القادمة من المستخدم
    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async m => {
        const messageId = m.content.trim(); // استخراج الـ ID المدخل من المستخدم
        try {
            const channel = interaction.channel;
            const message = await channel.messages.fetch(messageId);
            await interaction.followUp({ content: 'The message has been successfully deleted', ephemeral: true });
        } catch (error) {
            console.error('An error occurred while trying to delete the message:', error);
            await interaction.followUp({ content: 'An error occurred while trying to delete the message', ephemeral: true });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.followUp({ content: 'The ID was not provided to delete the message in time', ephemeral: true });
        }
    });
}


if (interaction.customId === 'rate_1_star' || interaction.customId === 'rate_2_star' || interaction.customId === 'rate_3_star' || interaction.customId === 'rate_4_star' || interaction.customId === 'rate_5_star') {
    // احتساب تقييم المستخدم
    const rating = interaction.customId.split('_')[1]; // الحصول على عدد النجوم من customId
    await interaction.reply({ content: `شكرا لتقييمك. لقد قيمت التذكرة بـ ${rating} نجمة.`, ephemeral: true });
}


if (interaction.customId === 'close_ticket') {
    // إرسال رسالة لتأكيد الإغلاق
    await interaction.reply({
        content: 'Are you sure you want to close this ticket?',
        ephemeral: true,
        components: [
            new MessageActionRow().addComponents(
                new MessageButton().setCustomId('confirm_close').setLabel('Close').setStyle('DANGER'),
                new MessageButton().setCustomId('cancel_close').setLabel('Cancel').setStyle('SECONDARY')
            )
        ]
    });
} else if (interaction.customId === 'confirm_close') {
    // Get the user who clicked the button
    const claimTicket = interaction.user;

    // قائمة المستخدمين مع عدد الرسائل
    let usersList = '';
    let totalMessages = 0;

    interaction.channel.messages.fetch().then(messages => {
        let usersMap = new Map();

        messages.forEach(message => {
            // تجاهل الرسائل المنشورة بواسطة البوت
            if (!message.author.bot) {
                // تجاهل الرسائل الخاصة بالأوامر
                if (!message.content.startsWith('!')) {
                    // تحديث العداد لعدد الرسائل
                    totalMessages++;

                    // تحديث الخريطة لتعداد الرسائل لكل مستخدم
                    let user = usersMap.get(message.author.id);
                    if (!user) {
                        user = { username: message.author.username, messageCount: 1 };
                    } else {
                        user.messageCount++;
                    }
                    usersMap.set(message.author.id, user);
                }
            }
        });

        // تحويل الخريطة إلى مصفوفة لفرز المستخدمين
        let sortedUsers = Array.from(usersMap.values()).sort((a, b) => b.messageCount - a.messageCount);

        // بناء النص لقائمة المستخدمين مع عدد الرسائل
        let index = 1;
        usersMap.forEach((user, userId) => {
            usersList += `**${index}. <@${userId}>** **\`${user.messageCount} Message\`**\n`;
            index++;
        });

        // إرسال Embed لطلب تقييم مع المعلومات المحدثة
        interaction.user.send({
            embeds: [{
                title: 'ما تقييمك؟',
                description: 'يرجى تقييم الخدمة بناءً على تجربتك',
                color: 0x00ff00,
                fields: [
                    { name: 'تم فتح بواسطة', value: `<@${ticketOpenerId}>`, inline: true },
                    { name: 'تم إغلاق بواسطة', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'تم الاستلام بواسطة', value: `${claimTicket}`, inline: true },
                    { name: 'الدعم المطلوب', value: `${selectedDepartment.rolesupport}`, inline: true },
                    { name: 'القسم', value: `\`\`\`${selectedDepartment.label}\`\`\``, inline: true },
                    { name: 'قائمة المستخدمين', value: `${usersList}`, inline: true },
                ],
                image: {
                    url: 'https://media.discordapp.net/attachments/1144066420922138757/1223814208253067425/0211.png?ex=662dadcc&is=661b38cc&hm=e8735267289d411df84fb6dfc8dee17d8014fe7c43867b8b468a4de95fb9ee07&format=webp&quality=lossless&width=1151&height=195'
                }
            }],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('rate_1_star').setLabel('⭐').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('rate_2_star').setLabel('⭐⭐').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('rate_3_star').setLabel('⭐⭐⭐').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('rate_4_star').setLabel('⭐⭐⭐⭐').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('rate_5_star').setLabel('⭐⭐⭐⭐⭐').setStyle('SECONDARY')
                )
            ]
        });
    });
}
  

    if (interaction.customId === 'confirm_close') {
    // إغلاق القناة ومنح الشخص الصلاحية
    const channel = interaction.channel;
    try {
        await channel.permissionOverwrites.edit(interaction.member, { VIEW_CHANNEL: false });

        // تأخير إرسال الـ Embed لمدة 3 ثواني
        setTimeout(async () => {
            const closedEmbed = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('The ticket is closed')
                .setDescription('The person who owned the ticket has closed this ticket. Do you want to delete it?');
            
            // إنشاء زر "delete ticket"
            const deleteButton = new MessageButton()
                .setCustomId('delete_ticket')
                .setLabel('Delete Ticket')
                .setStyle('DANGER');
            
            // إضافة الزر إلى صف الأزرار
            const row = new MessageActionRow().addComponents(deleteButton);
            
            // إرسال الـ Embed مع الزر
            await channel.send({ embeds: [closedEmbed], components: [row] });
        }, 1500);
       await interaction.reply({ content: 'This ticket has been closed', ephemeral: true });
    } catch (error) {
        console.error('Error closing ticket:', error.message);
        await interaction.reply({ content: 'Failed to close the ticket.', ephemeral: true });
    }
} else if (interaction.customId === 'delete_ticket') {
    // حذف التذكرة إذا تم النقر على زر "delete ticket"
    const channel = interaction.channel;
    try {
        await channel.delete();
    } catch (error) {
        console.error('Error deleting ticket:', error.message);
    }
}

    if (interaction.customId === 'cancel_close') {
    // إلغاء عملية الإغلاق
    await interaction.reply({ content: 'was canceled', ephemeral: true });
}
    


    if (interaction.customId === 'rename_ticket') {
        if (!hasClaimPermission(member)) {
            await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
            return;
        }
    await interaction.deferUpdate();
    const filter = m => m.author.id === interaction.user.id;
    
    try {
        const newNamePrompt = await interaction.followUp({ content: 'Please enter a new ticket name', ephemeral: true });
        const collectedMessages = await interaction.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });

        const newName = collectedMessages.first().content.trim();
        await interaction.channel.setName(newName);
        await collectedMessages.first().delete();
        await newNamePrompt.delete();
        await interaction.reply({ content: 'Channel renamed successfully.', ephemeral: true });
    } catch (error) {
        if (error instanceof DiscordAPIError && error.code === 50013) {
            console.error('Permission error:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        await interaction.reply({ content: 'Channel renaming has timed out.', ephemeral: true });
    }
}


    if (interaction.customId === 'add_member') {
    await interaction.deferUpdate();

    try {
        const filter = m => m.author.id === interaction.user.id;
        const addMemberPrompt = await interaction.followUp({ content: 'Please mention the person you want to add "<@user_id>" This is an example of adding a person \n https://cdn.discordapp.com/attachments/986209009088491541/1228926051275636788/HitPawOnline_6319.gif?ex=662dd192&is=661b5c92&hm=d7cd9ec1b5b539e8f44d263746f5fe4f6fbf646adb1ec08239be405631a1d5f2&', ephemeral: true });
        const collectedMessages = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

        const memberIdOrMention = collectedMessages.first().content.trim();
        const memberToAdd = guild.members.cache.get(memberIdOrMention.replace(/\D/g, ''));

        if (!memberToAdd) throw new Error('Member not found.');

        await interaction.channel.permissionOverwrites.create(memberToAdd, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ADD_REACTIONS: true
        });

        await collectedMessages.first().delete();
        await addMemberPrompt.delete();
        await interaction.reply({ content: `Member ${memberToAdd.user.tag} has been added to the ticket.`, ephemeral: true });

        // Send message directly after adding member successfully
        await interaction.channel.send('The person has been added successfully.');

    } catch (error) {
        console.error('Error adding member:', error.message);
        await interaction.reply({ content: 'Failed to add member. Please make sure you entered a valid ID or mention.', ephemeral: true });
    }
} else if (interaction.customId === 'remove_member') { // إضافة الجزء الجديد لإزالة الشخص
    await interaction.deferUpdate();

    try {
        const filter = m => m.author.id === interaction.user.id;
        const removeMemberPrompt = await interaction.followUp({ content: 'Please mention the person you want to remove "<@user_id>" This is an example of removing a person', ephemeral: true });
        const collectedMessages = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });

        const memberIdOrMention = collectedMessages.first().content.trim();
        const memberToRemove = guild.members.cache.get(memberIdOrMention.replace(/\D/g, ''));

        if (!memberToRemove) throw new Error('Member not found.');

        await interaction.channel.permissionOverwrites.delete(memberToRemove);

        await collectedMessages.first().delete();
        await removeMemberPrompt.delete();
        await interaction.reply({ content: `Member ${memberToRemove.user.tag} has been removed from the ticket.`, ephemeral: true });

        // Send message directly after removing member successfully
        await interaction.channel.send('The person has been successfully removed.');

    } catch (error) {
        console.error('Error removing member:', error.message);
        await interaction.reply({ content: 'Failed to remove member. Please make sure you entered a valid ID or mention.', ephemeral: true });
    }
}




if (interaction.customId === 'add_note') {
    // التحقق من وجود الصلاحية المطلوبة لاستخدام الأمر
    if (!hasClaimPermission(member)) {
        await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
        return;
    }

    await interaction.deferUpdate();

    try {
        const filter = m => m.author.id === interaction.user.id;
        const addNotePrompt = await interaction.followUp({ content: 'Please write your comment', ephemeral: true });
        const collectedMessages = await interaction.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });

        const note = collectedMessages.first().content.trim();

        // تحقق من وجود التضمين وإضافة الملاحظة إليه
        let embed = interaction.message.embeds[0];
        if (!embed) {
            embed = new MessageEmbed();
        }
        embed.addField(`Note (By @${interaction.user.username})`, `\`\`\`${note}\`\`\``); // إضافة اسم الشخص

        // تحديث الرسالة بالتضمين الجديد
        await interaction.editReply({ embeds: [embed], ephemeral: true });

        await collectedMessages.first().delete();
        await addNotePrompt.delete();
    } catch (error) {
        await interaction.reply({ content: 'Adding note failed. Please try again.', ephemeral: true });
    }
}







if (interaction.customId === 'sendowntick') {
    // إرسال رسالة لطلب النص المراد إرساله
    await interaction.reply({ 
        content: 'Please enter the text you want to send to the user:', 
        ephemeral: true 
    });

    // استماع لرسالة النص المدخلة من الشخص
    const filter = m => m.author.id === interaction.user.id;
    const collected = await interaction.channel.awaitMessages({
        filter,
        max: 1,
        time: 60000, // زمن الانتظار لمدة 60 ثانية
        errors: ['time']
    });

    // الحصول على النص المدخل
    const messageContent = collected.first().content;

    // حذف الرسالة المدخلة من المستخدم
    collected.first().delete();

    // إرسال النص المدخل للشخص الذي فتح التذكرة
    try {
        await interaction.user.send(`The following notification has been sent to you: ${messageContent}`);
        // إرسال رد بنجاح الإرسال
        await interaction.followUp({ content: 'Message sent successfully.', ephemeral: true });
    } catch (error) {
        console.error('Error sending message to user:', error.message);
    }
}



  
if (interaction.customId === 'claim_ticket') {
    // Check if the member has permission to claim
        const member = interaction.member; // استخدم member بدلاً من interaction.user
        if (!hasClaimPermission(member)) {
            await interaction.reply({ content: 'You do not have the authority to take this action', ephemeral: true });
            return;
        }

    // Get the user who clicked the button
    const claimTicket = interaction.user;

    // Send a confirmation message in the chat
    const claimMessage = `This Ticket Was Claimed By ${claimTicket}`;
    await interaction.channel.send(claimMessage);

    // Defer the interaction to prevent timeout
    await interaction.deferUpdate();
    
    // Send a confirmation message and edit the existing embed
    const embed = interaction.message.embeds[0];
    embed.fields.find(field => field.name === 'Claimed By').value = `${claimTicket}`; // Update the value of 'Ticket claimed By' field
    await interaction.editReply({ embeds: [embed], ephemeral: true });

    // Disable the claim button to prevent further claims
    const components = interaction.message.components; // Get existing components
    const rowIdx = components.findIndex(row => row.components.some(component => component.customId === 'claim_ticket')); // Find the row index containing the claim button
    if (rowIdx !== -1) {
        const row = components[rowIdx];
        const buttons = row.components.map(component => { // Map over components to update claim button
            if (component.customId === 'claim_ticket') {
                return new MessageButton()
                    .setCustomId('claim_ticket')
                    .setLabel('Claimed')
                    .setStyle('SUCCESS') // Change button style to secondary (greyed out)
                    .setDisabled(true); // Disable the button
            } else {
                return component;
            }
        });
        components[rowIdx] = new MessageActionRow().addComponents(...buttons); // Create a new row with updated buttons
        await interaction.editReply({ components });
    }

    return;
}

  

  
const selectMenuOptions = [
    {
        label: 'Buy Robux',
        value: 'ticket_1',
        rolesupport: '<@&1223827800473997353>',
        emoji: '⛔'
    },
    {
        label: 'Buy UC',
        value: 'ticket_2',
        rolesupport: '<@&1223827483661439066>',
        emoji: '⛔'
    },
    {
        label: 'Buy Project',
        value: 'ticket_3',
        rolesupport: '<@&1223828539879587860>',
        emoji: '⛔'
    },
    {
        label: 'Photoshop',
        value: 'ticket_4',
        rolesupport: '<@&1223828047644463144>',
        emoji: '⛔'
    },
    {
        label: 'Editing',
        value: 'ticket_5',
        rolesupport: '<@&1223828397898076190>',
        emoji: '⛔'
    },
    {
        label: 'Support',
        value: 'ticket_6',
        rolesupport: '<@&1223827487893487656>',
        emoji: '☑️'
    },
    {
        label: 'تقديم صانع محتوى',
        value: 'ticket_7',
        rolesupport: '<@&1223814666543697971>',
        emoji: '♾️'
    },
    {
        label: 'المواقع',
        value: 'ticket_8',
        rolesupport: '<@&1223814665356705823>',
        emoji: '🌐'
    },
    {
        label: 'وزارة الداخلية',
        value: 'ticket_9',
        rolesupport: '<@&1218325891361538201>',
        emoji: '👮‍♀️'
    },
    {
        label: 'وزارة الصحة والسكان',
        value: 'ticket_10',
        rolesupport: '<@&1218333911839543316>',
        emoji: '👨‍🔬'
    },
    {
        label: 'وزارة الدفاع',
        value: 'ticket_11',
        rolesupport: '<@&1218613841785782413>',
        emoji: '💂'
    },
    {
        label: 'شركة السحب والصيانة',
        value: 'ticket_12',
        rolesupport: '<@&1218348609926332516>',
        emoji: '👨‍🔧'
    }
];
  
    const selectedOption = interaction.values[0]; // القيمة المحددة من القائمة

    // ابحث عن الخيار المحدد في selectMenuOptions
    const selectedDepartment = selectMenuOptions.find(option => option.value === selectedOption);

    if (!selectedDepartment) return;



const categoryIDs = {
    'ticket_1': '1223831592758153247', //   
    'ticket_2': '1223831592758153247', //
    'ticket_3': '1223831592758153247', // 
    'ticket_4': '1223831592758153247', // 
    'ticket_5': '1223831592758153247', // 
    'ticket_6': '1223831592758153247', // 
    'ticket_7': '1223831592758153247', // 
    'ticket_8': '1223831592758153247', // 
    'ticket_9': '1223831592758153247', // 
    'ticket_10': '1223831592758153247', // 
    'ticket_11': '1223831592758153247', // 
    'ticket_12': '1223831592758153247', // 
};
  

if (interaction.customId === 'confirm_close') {
    // إرسال رسالة في الخاص بعد الضغط على الزر
    try {
        await interaction.user.send('تم');
    } catch (error) {
        console.error('Error sending message to user:', error.message);
    }
}
const ticketType = selectedOption.split('_')[1]; // يستخرج نوع التذكرة من القيمة المحددة في القائمة المنسدلة
const categoryID = categoryIDs[selectedOption]; // يحدد معرف الفئة بناءً على القيمة المحددة في القائمة المنسدلة

/*/
if (userTickets.has(member.id) && userTickets.get(member.id) >= 3) {
    await interaction.reply({ content: 'You have already opened three tickets.', ephemeral: true });
    return;
}
/*/

const channel = await guild.channels.create(`${selectedDepartment.label}-${ticketCounter}`, {
    type: 'text',
    permissionOverwrites: [
        {
            id: guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
        },
        {
            id: member.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS']
        },
        {
            id: client.user.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS']
        }
    ],
    parent: categoryID
});



// قم بتعديل الرسالة الراجعة لتحتوي على الزر
const replyMessage = `✔ Ticket Created <#${channel.id}> Ticket Number \`${ticketCounter}\``;

// قم بإنشاء صف واحد يحتوي على زر واحد
const row = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setLabel('Ticket Link')
			.setStyle('LINK') // يجعل الزر يفتح رابطًا
			.setURL(`https://discord.com/channels/740299333697536061/${channel.id}`)
	)

const egyptianDate = new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Cairo' });
const startTimestamp = Math.floor(Date.now() / 1000) - 27;
let count = channelCounts.get(channel.parentId) || 0;
count++;
const user = member.user;
await interaction.reply({ content: replyMessage, components: [row], ephemeral: true });
const embed = new MessageEmbed()
    .setTitle("<a:3_:1089615585232556204> Welcome To Server __Ra'ad__ Community <a:12:1150947511146664017>")
    .setDescription(`**Please Write Your Request**`)
    .setColor('#1c1c24')
    .addFields(
        { name: 'Ticket Generator', value: `${member}`, inline: true },
        { name: 'Support Required', value: `${selectedDepartment.rolesupport}`, inline: true },
        { name: 'Claimed By', value: `**Not Found**`, inline: true },
        { name: 'Section', value: `**\`\`\`${selectedDepartment.label}\`\`\`**`, inline: true },
        { name: 'Ticket Date', value: `**\`\`\`${egyptianDate}\`\`\`**`, inline: true },
        { name: 'Username', value: `**\`\`\`${member.user.username}\`\`\`**`, inline: true },
        { name: 'Ticket Since', value: `**┕<t:${startTimestamp}:R>**`, inline: true },
        { name: 'Joined Discord', value: `**┕<t:${Math.floor(user.createdTimestamp / 1000)}:R>**`, inline: true },
        { name: 'Joined Server', value: `**┕<t:${Math.floor(member.joinedTimestamp / 1000)}:R>**`, inline: true },
    );
  
    const closeButton = new MessageButton()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setStyle('DANGER');

    const renameButton = new MessageButton()
        .setCustomId('rename_ticket')
        .setLabel('Rename')
        .setStyle('PRIMARY');

    const addMemberButton = new MessageButton()
        .setCustomId('addmem_kikmem')
        .setLabel('Add Member')
        .setStyle('PRIMARY');

    const claimButton = new MessageButton()
        .setCustomId('claim_ticket')
        .setLabel('Claim Ticket')
        .setStyle('SUCCESS');

    const noteButton = new MessageButton()
        .setCustomId('add_note')
        .setLabel('Add Note')
        .setStyle('SECONDARY');
  
    const sendNotificationButton = new MessageButton()
        .setCustomId('msg_sendcontrol')
        .setLabel('Send Msg Member')
        .setStyle('SECONDARY');
  
    const msgcontrolButton = new MessageButton()
        .setCustomId('msg_control')
        .setLabel('Control Msg Ticket')
        .setStyle('SECONDARY');
  
    const row1 = new MessageActionRow()
    .addComponents(closeButton, renameButton, addMemberButton, claimButton);
const row2 = new MessageActionRow()
    .addComponents(noteButton, sendNotificationButton, msgcontrolButton);
    channel.send({ content: `**||${member} - ${selectedDepartment.rolesupport}||**`, embeds: [embed], components: [row1, row2] });

    ticketCounter++;

    if (userTickets.has(member.id)) {
        userTickets.set(member.id, userTickets.get(member.id) + 1);
    } else {
        userTickets.set(member.id, 1);
    }
});
const channelCounts = new Map();






client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'bot') {
        const duration = moment.duration(message.client.uptime).format(" D[d], H[h], m[m]");
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Stats from \`${client.user.username}\``)
            .setDescription(``)
            .addFields(
                { name: ':ping_pong: Ping', value: `┕\`${Math.round(client.ws.ping)}ms\``, inline: true },
                { name: ':file_cabinet: Memory', value: `┕\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb\``, inline: true },
                { name: ':homes: Servers', value: `┕\`${client.guilds.cache.size}\``, inline: true },
                { name: ':busts_in_silhouette: Users', value: `┕\`${client.users.cache.size}\``, inline: true },
                { name: ':robot: Version', value: `┕\`v${require("./package.json").version}\``, inline: true },
                { name: ':blue_book: Discord.js', value: `┕\`v${version}\``, inline: true },
                { name: ':green_book: Node', value: `┕\`${process.version}\``, inline: true },
                { name: ':clock1: Uptime', value: `┕\`${duration}\``, inline: true },
                { name: ':control_knobs: API Latency', value: `┕\`${(message.client.ws.ping)}ms\``, inline: true }
            );
        message.reply({ embeds: [embed] });
    }
});



client.on("messageCreate", (message) => {
  if (message.content === "مرحبا") {
    message.reply("مرحبا بك!");
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "السلام عليكم") {
    message.reply("❤ عليكم السلام ياجميل منور السيرفر والله ❤");
  }
});
client.on("messageCreate", (message) => {
  if (message.content === "صلي علي النبي") {
    message.reply("❤ **عليه الصلاة والسلام** ❤");
  }
});
client.on("messageCreate", (message) => {
  if (message.content === "هلا") {
    message.reply("❤ هلا بيك شلونك حبيبي منور السيرفر ❤");
  }
});


client.on("messageCreate", (message) => {
  if (message.content.startsWith(prefix + "say")) {
    const args = message.content.slice(prefix.length + "say".length).trim();
    const user = message.author;
    if (!args) return message.reply("Please provide me a message! ⚠️");
    message.channel.send(args);
  }
});


  /* Client when detects a message 
  then execute the code */
  client.on("messageCreate", async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "help") {
        message.reply({
          embeds: [ new MessageEmbed()
            .setDescription(`> **__All  Commands__** 
\n **!add** \n **!ping** \n **!role-list** \n **!channel** \n **!ruleschannel** \n  **!background** \n **!setchannel** \n **!setruleschannel** \n **!setbackground**`)
            .setColor("#2F3136")
          ]
        })
    }
    if(command === "ping02") {
      message.reply(`> \`-\` **My Ping Is :** \`${client.ws.ping}\``)
    }
    if(command === "add") {
     client.emit("guildMemberAdd", message.member)
    }
    if(command === "setchannel") {
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      let channel = message.mentions.channels.first()
      if(!channel) return message.reply(`:x: | Missing arguments, required \`<channel>\`\n __Example__: ${prefix}setchannel ${message.channel}`)
      await db.set(`${message.guild.id}`, channel.id)
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(`👍 | Successfully set the welcome channel to ${channel}`)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
    if(command === "channel") {
      let channel = await db.get(`${message.guild.id}`)
      if(channel) {
        message.reply({
          embeds: [ new MessageEmbed()
            .setDescription(`📝 | The welcome channel is set to ${message.guild.channels.cache.get(channel)}`)
            .setColor("#2F3136")
            .setTimestamp()
          ]
        })
      }
    }
    if(command === "setbackground"){
      if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
      if(args[0] && !args[0].startsWith("http")) return message.reply("Please provide a valid URL for an image **or** upload an image to set as background.")
      let background = message.attachments.first() ? message.attachments.first().url : args[0]
      if(!background) return message.reply(`:x: | Missing arguments, required \`<background>\`\n __Example__: ${prefix}setbackground <attachment> [ Can be URL or an uploaded image ]`)
      await db.set(`bg_${message.guild.id}`, background)
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(`👍 | Successfully set the background to [this image](${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
    if(command === "background") {
    let background = await db.get(`bg_${message.guild.id}`)
    if(background) {
      message.reply({
        embeds: [ new MessageEmbed()
          .setDescription(`📝 | The background is set to [this image](${background})`)
          .setImage(background)
          .setColor("#2F3136")
          .setTimestamp()
        ]
      })
    }
  }
if(command === "setruleschannel"){
  if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
  if(!args[0]) return message.reply("Please provide a description to set.")

  let description = args.join(" ")
  
  // Save the description text instead of the image URL
  await db.set(`description_${message.guild.id}`, description)
  
  message.reply({
    embeds: [ new MessageEmbed()
      .setDescription(`👍 | Successfully set the description to: **${description}**`)
      .setColor("#2F3136")
      .setTimestamp()
    ]
  })
}
if(command === "setimage"){
  if(!message.member.permissions.has("MANAGE_GUILD")) return message.reply(":x: | Missing permissions, require `MANAGE_GUILD`")
  if(!args[0]) return message.reply("Please provide a description to set.")

  let image = args.join(" ")
  
  // Save the description text instead of the image URL
  await db.set(`description_${message.guild.id}`, image)
  
  message.reply({
    embeds: [ new MessageEmbed()
      .setDescription(`👍 | Successfully set the description to: **${image}**`)
      .setColor("#2F3136")
      .setTimestamp()
    ]
  })
}
if(command === "image") {
  let image = await db.get(`description_${message.guild.id}`)
  if(image) {
    message.reply({
      embeds: [ new MessageEmbed()
        .setDescription(`📝 | The description is set to: **${image}**`)
        .setColor("#2F3136")
        .setTimestamp()
      ]
    })
  }
}

if(command === "ruleschannel") {
  let description = await db.get(`description_${message.guild.id}`)
  if(description) {
    message.reply({
      embeds: [ new MessageEmbed()
        .setDescription(`📝 | The description is set to: **${description}**`)
        .setColor("#2F3136")
        .setTimestamp()
      ]
    })
  }
}

}

);
/* Client when detects 
a new member join */
  tracker = new inviteTracker(client);
// "guildMemberAdd"  event to get full invite data
tracker.on('guildMemberAdd', async (member, inviter, invite, error) => {
  let channelwelc = await db.get(`${member.guild.id}`)
  if(error) return console.error(error);
  if(!channelwelc) return;
  let channel = member.guild.channels.cache.get(channelwelc)
   let buffer_attach =  await generareCanvas(member)
   const attachment = new MessageAttachment(buffer_attach, 'welcome.png')
   const startTimestamp = Math.floor(Date.now() / 1000) - 27;
   const memberCount = member.guild.memberCount;


   // Fetch the description from the database
   let description = await db.get(`description_${member.guild.id}`);

   let embed = new MessageEmbed()
      .setTitle(`> <:TAG:1230615422852796566> Welcome to __${member.guild.name}__ Community`)
      .addFields(
        { name: '<:WELCOME:1230615431274958980> Welcome', value: `${member.user}`, inline: true },
        { name: '<:INVITED:1230615439844048958> Invited By', value: `<@!${inviter.id}>`, inline: true },
        { name: '<:READ:1230615413474328658> Rules', value: `${description}`, inline: true }, // Using the fetched description here
        { name: '<:USER_ID:1230615428376559749> User ID', value: `\`\`${member.user.id}\`\``, inline: true },
        { name: '<:NUMPER:1230615407602176020> Member Count', value: `**\`\`${memberCount}\`\`**`, inline: true },
        { name: '<:LINK2:1230615404481872034> Invite Number', value: `**\`\`${invite.count}\`\`**`, inline: true },
        { name: '<:TIME:1230615425834811454> Message Since', value: `<t:${startTimestamp}:R>`, inline: true },
        { name: '<:JOINED:1230615399012372571> Joined Discord', value: `<t:${Math.floor(member.user.createdAt / 1000)}:R>`, inline: true },
        { name: '<:SHARDS:1230615416141779105> Member User', value: `**\`\`${member.user.username}\`\`**`, inline: true },
        { name: '<:API:1230615434106245141> Node.js Version', value: `**__\`\`v21.7.2\`\`__**`, inline: true },
        { name: '<:PING:1230615410467016788> PING BOT', value: `**__\`\`${client.ws.ping}ms\`\`__**`, inline: true },
        { name: '<:DEVELOPER:1230615437042258002> Developer BOT ', value: `<@803873969168973855>`, inline: true },
        { name: '<:SUPPORT:1230615419572981871> Server Support ', value: `**[Click Here](https://dsc.gg/kn-server)**`, inline: true },
        { name: '<:LINK:1230615401394868225> Instagram ', value: `**[Click Here](https://www.instagram.com/ahm.depression)**`, inline: true },
        { name: '<:LINK2:1230615404481872034> Twitter', value: `**[Click Here](https://twitter.com/ahm_depression)**`, inline: true }
      )
    .setColor('#2F3136')
    .setImage("attachment://welcome.png")

    channel.send({ content: `||${member.user}||`, embeds: [embed], files: [attachment] })
})

client.on('guildMemberAdd', member => {
    const egyptianDate = new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Cairo' });
    const startTimestamp = Math.floor(Date.now() / 1000) - 27;

    const rulesButton = new MessageButton()
        .setStyle('LINK')
        .setLabel('قوانين السيرفر')
        .setURL('https://discord.com/channels/1089614823374991520/1144343379505860741');
  
    const fourSeasonButton = new MessageButton()
        .setStyle('LINK')
        .setLabel('سيرفر راعد')
        .setURL('https://dsc.gg/clipper-tv'); // رابط موقع الـ 4 SEASON

    const instaButton = new MessageButton()
        .setStyle('LINK')
        .setLabel('الانستقرام')
        .setURL('https://www.instagram.com/ahm.depression'); // رابط موقع الـ 4 SEASON


    const buttonRow = new MessageActionRow()
        .addComponents([instaButton, fourSeasonButton, rulesButton]);

    const embed = new MessageEmbed()
        .setColor('#2c2c34')
        .setTitle("> Ra'ad Server اهلا بكم في سيرفر")
        .setDescription(`**نحن سعداء بوجودك معنا في السيرفر نتمنى لكم يوما سعيدا \n\n**`)
        .addFields(
            { name: '**1. يرجى قراءة القوانين لتجنب المشاكل في السيرفر**', value: `**<#1144343379505860741>**`, inline: false },
            { name: '**3. دخلت السيرفر منذ**', value: `**<t:${startTimestamp}:R>**`, inline: true },
            { name: '**2. تاريخ دخولك للسيرفر**', value: `**\`\`${egyptianDate}\`\`**`, inline: true }
          )    
        .setImage('https://cdn.discordapp.com/attachments/1144347868220620950/1227286242291351692/standard.gif?ex=663114e2&is=661e9fe2&hm=5b2e509608885941b040359775b84cce3346b1fd225f96a4fa8eb7497680603c&')
        .setThumbnail(member.user.displayAvatarURL({ size: 4096 }));

    member.send({ embeds: [embed], components: [buttonRow] })
        .then(() => console.log('Sent welcome message with buttons to', member.user.tag))
        .catch(console.error);
});


async function generareCanvas(member) {
  const avatar = await loadImage(member.user.displayAvatarURL({ 'size': 2048, 'format': "png" }))
  const background = await loadImage(await db.get(`bg_${member.guild.id}`)) ?? await loadImage("https://cdn.discordapp.com/attachments/910400703862833192/910426253947994112/121177.png")
  const { weirdToNormalChars } = require('weird-to-normal-chars')
  const name = weirdToNormalChars(member.user.username)
  let canvas = new Canvas(1024, 450)
    .printImage(background, 0, 0, 1024, 450)
    .setColor("#FFFFFF")
    .printCircle(512, 155, 120)
    .printCircularImage(avatar, 512, 155, 115)
    .setTextAlign('center')
    .setTextFont('70px Discord')
    .printText(`Welcome`, 512, 355)
    .setTextAlign("center")
    .setColor("#FFFFFF")
    .setTextFont('45px Discordx')
    .printText(`${name}`, 512, 395)
    .setTextAlign("center")
    .setColor("#FFFFFF")
    .setTextFont('30px Discord')
    .printText(`To ${member.guild.name}`, 512, 430)
    // Adding "bot by ahmed" text above the image
    .setTextAlign('center')
    .setTextFont('bold 15px Arial')
    .setColor("#FFFFFF")
    .printText('</> Developer BOT Ahmed Clipper', 160, 25);
    // Adding "insta" text below the line
  canvas.setTextAlign('center')
    .setTextFont('bold 15px Arial')
    .setColor("#FFFFFF")
    .printText('</> instagram : ahm.depression', 150, 60);
  return canvas.toBufferAsync()
}



client.login(token)
