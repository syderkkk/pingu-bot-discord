import { GuildMember } from "discord.js";
import { BaseEmbedSchema } from "../../discord/embed/BaseEmbedSchema";
import { embedBuilder } from "../../discord/embed/embedBuilder";

export function onGuildMemberAdd(member: GuildMember): void {

    if (!member.guild.systemChannel) {
        console.warn(`[Guild: ${member.guild.name} = ${member.guild.id}] System channel not found.`);
        return;
    }
    const embedData = {
        title: "Member Joined!",
        description: `Welcome, ${member.user.username}! We're glad to have you here.`,
        color: "3498DB",
    };

    const parsed = BaseEmbedSchema.safeParse(embedData);

    if (parsed.success) {
        const embed = embedBuilder(parsed.data);
        member.guild.systemChannel.send({ embeds: [embed] }).catch((error) => {
            console.error(`[Guild: ${member.guild.name} = ${member.guild.id}] Failed to send embed:`, error);
        });
    } else {
        console.error(`[Guild: ${member.guild.name} = ${member.guild.id}] Embed validation failed:`, parsed.error);
    }
}