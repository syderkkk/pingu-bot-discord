import { BotManager } from "./bot/BotManager";
import "dotenv/config";

async function main(): Promise<void> {
    try {
        const token = process.env.token;
        if (!token) {
            throw new Error("Token is not defined in environment variables.");
        }

        const botManager = new BotManager(token);
        await botManager.start();

    } catch (error) {
        console.error("An error occurred:", error);
        process.exit(1);
    }
}

void main();