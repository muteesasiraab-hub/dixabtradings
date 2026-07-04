import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const USD_RATE = 3800;

const PRODUCTS = [
  {
    sku: "flash-disk",
    name: "Abbdix Flash Disk",
    status: "available",
    priceUGX: 100000,
    description:
      "Branded entry product. Purchasing activates membership in the recommendation community.",
  },
  {
    sku: "earbuds",
    name: "Wireless Earbuds",
    status: "coming_soon",
    priceUGX: null,
    description: "Upcoming product in the Abbdix catalog.",
  },
  {
    sku: "bag",
    name: "Branded Bag",
    status: "coming_soon",
    priceUGX: null,
    description: "Upcoming product in the Abbdix catalog.",
  },
  {
    sku: "mug",
    name: "Branded Mug",
    status: "coming_soon",
    priceUGX: null,
    description: "Upcoming product in the Abbdix catalog.",
  },
];

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List the products currently profiled on the Abbdix General Trading platform, including UGX and USD price equivalents.",
  inputSchema: {
    status: z
      .enum(["available", "coming_soon", "all"])
      .optional()
      .describe("Filter by product status. Defaults to all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status }) => {
    const filter = status ?? "all";
    const items = PRODUCTS.filter(
      (p) => filter === "all" || p.status === filter,
    ).map((p) => ({
      ...p,
      priceUSD: p.priceUGX == null ? null : +(p.priceUGX / USD_RATE).toFixed(2),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items, usdRate: USD_RATE },
    };
  },
});
