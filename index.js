require('dotenv').config();
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { ethers } = require('ethers');

// Load feeds.json
const feedsData = require('./feeds.json');

// Full Chainlink AggregatorV3Interface ABI
const priceFeedAbi = [
  'function decimals() view returns (uint8)',
  'function description() view returns (string)',
  'function version() view returns (uint256)',
  'function getRoundData(uint80 _roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
];

// Create MCP server
const server = new McpServer({
  name: 'Chainlink Feeds',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// Tool schema for latest price
const latestPriceSchema = z.object({
  pair: z.string().describe('The price feed pair, e.g., FIL/ETH or FDUSD/USD'),
  chain: z.string().refine((val) => feedsData[val.toLowerCase()], {
    message: 'Unsupported chain'
  }).describe('The blockchain network, e.g., ethereum or base')
});

// Tool: Get latest price
server.tool(
  'getLatestPrice',
  'Fetches the latest price for a given pair on a specified chain',
  latestPriceSchema,
  async ({ pair, chain }) => {
    try {
      // Validate inputs
      const chainKey = chain.toLowerCase();
      latestPriceSchema.parse({ pair, chain });

      // Find feed by pair
      const feed = feedsData[chainKey].feeds.find((f) => f.name.toLowerCase() === pair.toLowerCase());
      if (!feed) {
        throw new Error(`Pair ${pair} not found on chain ${chain}`);
      }

      // Initialize provider and contract
      const provider = new ethers.JsonRpcProvider(`${feedsData[chainKey].baseUrl}/${process.env.INFURA_API_KEY}`);
      const priceFeedContract = new ethers.Contract(feed.proxyAddress, priceFeedAbi, provider);

      // Fetch decimals and latest round data
      const [decimals, roundData] = await Promise.all([
        priceFeedContract.decimals(),
        priceFeedContract.latestRoundData()
      ]);

      const price = ethers.formatUnits(roundData.answer, decimals);
      const timestamp = Number(roundData.updatedAt) * 1000;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            chain,
            pair,
            price: Number(price),
            decimals: Number(decimals),
            roundId: roundData.roundId.toString(),
            timestamp: new Date(timestamp).toISOString(),
            proxyAddress: feed.proxyAddress,
            feedCategory: feed.feedCategory
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool schema for querying price by round ID
const queryPriceSchema = z.object({
  roundId: z.string().regex(/^\d+$/, 'Round ID must be a number').describe('The round ID for the price data'),
  pair: z.string().describe('The price feed pair, e.g., FIL/ETH or FDUSD/USD'),
  chain: z.string().refine((val) => feedsData[val.toLowerCase()], {
    message: 'Unsupported chain'
  }).describe('The blockchain network, e.g., ethereum or base')
});

// Tool: Query price by round ID (placeholder)
server.tool(
  'queryPriceByRound',
  'Queries the price for a given pair and round ID on a specified chain (placeholder due to historical data limitations)',
  queryPriceSchema,
  async ({ roundId, pair, chain }) => {
    try {
      // Validate inputs
      const chainKey = chain.toLowerCase();
      queryPriceSchema.parse({ roundId, pair, chain });

      // Find feed by pair
      const feed = feedsData[chainKey].feeds.find((f) => f.name.toLowerCase() === pair.toLowerCase());
      if (!feed) {
        throw new Error(`Pair ${pair} not found on chain ${chain}`);
      }

      // Initialize provider and contract
      const provider = new ethers.JsonRpcProvider(`${feedsData[chainKey].baseUrl}/${process.env.INFURA_API_KEY}`);
      const priceFeedContract = new ethers.Contract(feed.proxyAddress, priceFeedAbi, provider);

      // Note: getRoundData may not be supported for historical rounds
      const decimals = await priceFeedContract.decimals();
      const roundData = await priceFeedContract.latestRoundData(); // Placeholder

      const price = ethers.formatUnits(roundData.answer, decimals);
      const timestamp = Number(roundData.updatedAt) * 1000;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            chain,
            pair,
            price: Number(price),
            decimals: Number(decimals),
            roundId,
            timestamp: new Date(timestamp).toISOString(),
            proxyAddress: feed.proxyAddress,
            feedCategory: feed.feedCategory
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool schema for listing supported chains
const listSupportedChainsSchema = z.object({}).describe('No parameters required');

// Tool: List all supported chains
server.tool(
  'listSupportedChains',
  'Returns a comma-separated list of all supported blockchain networks',
  listSupportedChainsSchema,
  async () => {
    try {
      // Get all chain names as comma-separated string
      const chains = Object.keys(feedsData).join(',');

      return {
        content: [{
          type: 'text',
          text: chains
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool schema for listing feeds by chain
const listSupportedFeedsByChainSchema = z.object({
  chain: z.string().refine((val) => feedsData[val.toLowerCase()], {
    message: 'Unsupported chain'
  }).describe('The blockchain network, e.g., ethereum or base')
});

// Tool: List feeds for a specific chain
server.tool(
  'listSupportedFeedsByChain',
  'Returns a comma-separated list of price feed names for a specified blockchain network',
  listSupportedFeedsByChainSchema,
  async ({ chain }) => {
    try {
      // Validate inputs
      const chainKey = chain.toLowerCase();
      listSupportedFeedsByChainSchema.parse({ chain });

      // Get feed names as comma-separated string
      const feedNames = feedsData[chainKey].feeds.map((feed) => feed.name).join(',');

      return {
        content: [{
          type: 'text',
          text: feedNames
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Tool schema for listing all supported feeds
const listSupportedFeedsSchema = z.object({}).describe('No parameters required');

// Tool: List all supported chains and feeds
server.tool(
  'listSupportedFeeds',
  'Returns a Markdown list of all supported chains and their price feed names',
  listSupportedFeedsSchema,
  async () => {
    try {
      // Prepare Markdown list
      const markdownList = Object.keys(feedsData).map((chain) => {
        const feedNames = feedsData[chain].feeds.map((feed) => feed.name).join(',');
        return `- ${chain}: ${feedNames}`;
      }).join('\n');

      return {
        content: [{
          type: 'text',
          text: markdownList
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }
);
  
// Start server with Stdio transport
async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer().catch(console.error);