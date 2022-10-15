const TOKEN = 'OTMxMDY2ODU5NzI4NTY0Mjg1.GvhlfP.WfCUENBkKNXjMmcxPw1p2tg2mKQ2sqculjc4eE';

const { Client, GatewayIntentBits, Collection  } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.on('ready', () =>{
    const clientId = client.application.id
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    (async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
    console.log(`${client.name}`)
});

client.on('interactionCreate', async (interaction) => {

    if(!(interaction.isCommand())) return;
    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    console.log(`[${interaction.guild.name}(${interaction.member.displayName})] ${interaction.commandName}`);

    try {
        await command.execute(interaction);
    } catch (error){
        if(error) console.error(error);
        await interaction.reply({
            content :"Error with this command.",
            ephemeral: true
        });
    }
});


client.login(TOKEN);