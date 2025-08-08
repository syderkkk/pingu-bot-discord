import { ActivityType, Client } from "discord.js";

export async function onReady(client: Client): Promise<void> {
    if (!client.user) return;

    console.log(`Logged in as ${client.user.tag} (${client.user.id})`);

    client.user.setPresence({
        activities: [
            {
                name: "Pingubot - nookW",
                type: ActivityType.Watching
            },
        ],
        status: "online",
    });
}