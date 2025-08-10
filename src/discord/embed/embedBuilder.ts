import { ColorResolvable, EmbedBuilder } from "discord.js";
import { BaseEmbed } from "./BaseEmbedSchema";

export function embedBuilder(embed: BaseEmbed): EmbedBuilder {
  const builder = new EmbedBuilder();

  if (embed.title) builder.setTitle(embed.title);
  if (embed.description) builder.setDescription(embed.description);
  if (embed.url) builder.setURL(embed.url);
  if (embed.timestamp) builder.setTimestamp(new Date(embed.timestamp));

  if (embed.color) {
    let colorValue = embed.color;
    if (typeof colorValue === "string" && !colorValue.startsWith("#")) {
      colorValue = "#" + colorValue;
    }
    builder.setColor(colorValue as ColorResolvable);
  }

  if (embed.footer)
    builder.setFooter({
      text: embed.footer.text,
      iconURL: embed.footer.icon,
    });
  if (embed.image) builder.setImage(embed.image);
  if (embed.thumbnail) builder.setThumbnail(embed.thumbnail);
  if (embed.author)
    builder.setAuthor({
      name: embed.author.name,
      url: embed.author.url,
      iconURL: embed.author.icon,
    });

  return builder;
}