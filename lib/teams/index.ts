import { BotFrameworkAdapter } from 'botbuilder';
import { TeamsBot } from './bot';

// Create adapter with authentication
export const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Catch-all for errors
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );
    await context.sendActivity('The bot encountered an error or bug.');
};

// Create the bot instance
export const bot = new TeamsBot(); 