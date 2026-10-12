import { defineMcp } from "@lovable.dev/mcp-js";
import getPlatformInfo from "./tools/get-platform-info";
import listProducts from "./tools/list-products";

export default defineMcp({
  name: "dixab-general-trading-mcp",
  title: "Dixab General Tradings Co. Ltd",
  version: "0.1.0",
  instructions:
    "Public tools for Dixab General Tradings Co. Ltd. Use `get_platform_info` for the mission, vision, and how the recommendation model works. Use `list_products` to browse profiled products with UGX/USD prices.",
  tools: [getPlatformInfo, listProducts],
});
