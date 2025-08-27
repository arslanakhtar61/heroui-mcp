/**
 * Main entry point for HeroUI MCP Server
 */

import { config } from "dotenv";
import { logger } from "@utils/logger.js";
import { HeroUiMcpApplication } from "./app.js";

// Load environment variables from .env file
config();
import { getTransportType } from "./transport/transport.factory.js";

/**
 * Main function to start the application
 */
async function main(): Promise<void> {
	try {
		const transportType = getTransportType();
		// Configure logger based on transport
		if (transportType === "stdio") {
			logger.configure({ silent: true }); // Disable logs in stdio mode
			// Still log this one message to confirm transport mode
			console.error(`Starting in stdio mode (transport=${process.env.TRANSPORT})`);
		} else {
			logger.info(`Starting in ${transportType} mode (transport=${process.env.TRANSPORT})`);
		}

		const app = new HeroUiMcpApplication();

		// Handle graceful shutdown
		const shutdown = async (signal: string) => {
			logger.info(`Received ${signal}, shutting down gracefully`);
			await app.stop();
			process.exit(0);
		};

		process.on("SIGINT", () => shutdown("SIGINT"));
		process.on("SIGTERM", () => shutdown("SIGTERM"));

		// Start the application
		await app.start();
	} catch (error) {
		logger.error("Failed to start application:", error);
		process.exit(1);
	}
}

// Start the application
main().catch((error) => {
	logger.error("Unhandled error in main:", error);
	process.exit(1);
});
