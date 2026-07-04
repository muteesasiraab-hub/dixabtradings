import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_platform_info",
  title: "Get platform info",
  description:
    "Return an overview of Abbdix General Trading: mission, vision, entry fee, and how the 5-level recommendation model works.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            name: "Abbdix General Trading",
            tagline:
              "A platform where opportunities meet innovation — physical products and a recommendation earning model.",
            mission:
              "To unlock economic opportunity across Africa by empowering every individual to become a trusted brand ambassador, turning word-of-mouth into rewarding, sustainable income.",
            vision:
              "To transform every African into an empowered entrepreneur by building a decentralized, trust-based sales ecosystem that rewards genuine connections.",
            entryFeeUGX: 100000,
            earningPerReferralUGX: 10000,
            directReferralCap: 3,
            levels: 5,
          },
          null,
          2,
        ),
      },
    ],
  }),
});
