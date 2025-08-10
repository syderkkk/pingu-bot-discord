import { GuildMember } from "discord.js";
import { BaseEmbedSchema } from "../../discord/embed/BaseEmbedSchema";
import { embedBuilder } from "../../discord/embed/embedBuilder";

export function onGuildMemberRemove(member: GuildMember): void {

    if (!member.guild.systemChannel) {
        console.warn(`[Guild: ${member.guild.name} = ${member.guild.id}] System channel not found.`);
        return;
    }

    const embedData = {
        title: "Member Left!",
        description: `Goodbye, ${member.user.username}! We hope to see you again soon.`,
        color: "FFD700",
    };

    const parsed = BaseEmbedSchema.safeParse(embedData);

    if (parsed.success) {
        const embed = embedBuilder(parsed.data);
        member.guild.systemChannel.send({ embeds: [embed] }).catch((error) => {
            console.error(`[Guild: ${member.guild.name} = ${member.guild.id}] Failed to send embed:`, error);
        })
    } else {
        console.error(`[Guild: ${member.guild.name} = ${member.guild.id}] Embed validation failed:`, parsed.error);
    }
    
}