import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { ServerConfig } from "../config/server.config.js";
import { logger } from "../utils/logger.js";

export type TransportType = "http" | "stdio";

export function getTransportType(): TransportType {
  return (process.env.TRANSPORT || "http").toLowerCase() as TransportType;
}

export class TransportFactory {
  constructor(private readonly config: ServerConfig) {}

  createTransport() {
    const transportType = getTransportType();

    if (transportType === "stdio") {
      logger.info("Using stdio transport");
      const transport = new StdioServerTransport();
      // Add connection listeners
      transport.onmessage = (msg) => {
        console.error(`[DEBUG] Received message in stdio mode: ${JSON.stringify(msg)}`);
      };
      return transport;
    }

    logger.info("Using HTTP transport");
    return new StreamableHTTPServerTransport({
      enableDnsRebindingProtection: this.config.enableDnsRebindingProtection,
      allowedHosts: this.config.allowedHosts,
      sessionIdGenerator: this.config.sessionIdGenerator
    });
  }
}
