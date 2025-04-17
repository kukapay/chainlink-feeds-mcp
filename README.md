# Chainlink Feeds MCP Server

An MCP server that provides real-time access to Chainlink's decentralized on-chain price feeds, optimized for seamless integration into AI agents and autonomous systems

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

## Features

- **Query Latest Price**: Fetch the latest price for a specified price feed pair (e.g., `FIL/ETH`) on a given chain (e.g., `ethereum`), including price, decimals, round ID, and timestamp.
- **Query Price by Round ID**: Retrieve price data for a specific round ID (currently a placeholder due to on-chain historical data limitations).
- **List Supported Chains**: Get a comma-separated list of supported blockchain networks (e.g., `ethereum,base`).
- **List All Feeds**: Retrieve a Markdown-formatted list of all chains and their price feed names (e.g., `- ethereum: FIL/ETH,FDUSD/USD`).
- **List Feeds by Chain**: Obtain a comma-separated list of price feed names for a specific chain (e.g., `FIL/ETH,FDUSD/USD` for `ethereum`).
- **Configurable Feeds**: Define price feeds and RPC endpoints in a `feeds.json` file, supporting multiple chains and feed categories.

## Supported Chains and Feeds

The server supports **9 blockchain networks** with a total of **329 price feeds**, as defined in `feeds.json`:

- **Ethereum**: 107 feeds (e.g., `FIL/ETH`, `BTC/USD`, `USDC/USD`)
- **BNB Chain (bsc)**: 80 feeds (e.g., `DOT/USD`, `CAKE/USD`, `BUSD/BNB`)
- **Base**: 52 feeds (e.g., `AXL/USD`, `USDC/USD`, `WIF/USD`)
- **Starknet**: 9 feeds (e.g., `ETH/USD`, `BTC/USD`, `WSTETH/ETH`)
- **Linea**: 15 feeds (e.g., `ETH/USD`, `FOXY/USD`, `MATIC/USD`)
- **Mantle**: 6 feeds (e.g., `MNT/USD`, `USDT/USD`, `BTC/USD`)
- **Scroll**: 22 feeds (e.g., `SCR/USD`, `STETH/USD`, `WBTC/BTC`)
- **zkSync**: 16 feeds (e.g., `ZK/USD`, `PEPE/USD`, `TRUMP/USD`)
- **Celo**: 22 feeds (e.g., `CELO/USD`, `CUSD/USD`, `NGN/USD`)

Additional chains and feeds can be added by updating `feeds.json` with new network configurations and proxy addresses from Chainlink's Price Feeds documentation.

## Prerequisites

- **Node.js**: Version 18.x or higher.
- **npm**: For dependency installation.
- **Infura API Key**: Obtain a key from the [MetaMask Developer Dashboard](https://infura.io/) with access to supported networks (e.g., Ethereum, Base).
- **MCP Inspector** (optional): For testing the server locally.
- **Claude Desktop** (optional): For integration with Anthropic's Claude interface.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kukapay/chainlink-feeds-mcp.git
   cd chainlink-feeds-mcp
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   The project requires:
   - `@modelcontextprotocol/sdk`: For MCP server functionality.
   - `ethers`: Version 6.x for blockchain interactions.
   - `zod`: For input validation.
   - `dotenv`: For environment variable management.

3. **Configure MCP Client**:
   To use this server with an MCP client like Claude Desktop, add the following to your config file (or equivalent):
    ```json
    {
      "mcpServers": {
        "chainlink-feeds-mcp": {
          "command": "node",
          "args": ["path/to/chainlink-feeds-mcp/index.js"],
          "env": { "INFURA_API_KEY": "your_api_key_here" }
        }
      }
    }   
    ```
## Usage

The server exposes five tools via the MCP protocol, accessible through **Claude Desktop** (for natural language queries) or **MCP Inspector** (for JSON inputs). Below are the tools, with examples in both natural language (via Claude Desktop) and JSON formats.

### Tool: `getLatestPrice`

- **Description**: Fetches the latest price for a given pair on a specified chain, returns a JSON object like this:
    ```json
    {
      "chain": "ethereum",
      "pair": "FIL/ETH",
      "price": 0.01234,
      "decimals": 18,
      "roundId": "123456",
      "timestamp": "2025-04-17T12:00:00.000Z",
      "proxyAddress": "0x0606Be69451B1C9861Ac6b3626b99093b713E801",
      "feedCategory": "medium"
    }
    ```

- **Parameters**:
  - `pair` (string): The price feed pair, e.g., `FIL/ETH`.
  - `chain` (string): The blockchain network, e.g., `ethereum`.

- **Natural Language Example (Claude Desktop)**:
  
  > **Input**: "What¡¯s the latest FIL/ETH price on Ethereum?"
  
  > **Output**: "The latest FIL/ETH price on Ethereum is 0.01234, with 18 decimals, round ID 123456, updated at 2025-04-17 12:00:00 UTC."


### Tool: `queryPriceByRound`

- **Description**: Queries the price for a given pair and round ID on a specified chain, returns a JSON object like this:
    ```json
    {
      "chain": "ethereum",
      "pair": "FDUSD/USD",
      "price": 1.0001,
      "decimals": 8,
      "roundId": "123",
      "timestamp": "2025-04-17T12:00:00.000Z",
      "proxyAddress": "0xfAA9147190c2C2cc5B8387B4f49016bDB3380572",
      "feedCategory": "medium"
    }
    ```


- **Parameters**:
  - `roundId` (string): The round ID for the price data.
  - `pair` (string): The price feed pair, e.g., `FDUSD/USD`.
  - `chain` (string): The blockchain network, e.g., `ethereum`.

- **Natural Language Example (Claude Desktop)**:
  
  > **Input**: "Can you get the FDUSD/USD price for round ID 123 on Ethereum?"
  
  > **Output**: "For round ID 123, the FDUSD/USD price on Ethereum is 1.0001, with 8 decimals, updated at 2025-04-17 12:00:00 UTC. Note: This is a placeholder response due to historical data limitations."

### Tool: `listSupportedChains`

- **Description**: Returns a comma-separated list of all supported blockchain networks.

- **Parameters**: None.

- **Natural Language Example (Claude Desktop)**:
  
  > **Input**: "Which blockchain networks does this server support?"
  
  > **Output**: "The server supports the following networks: ethereum, bsc, base, starknet, linea, mantle, scroll, zksync, celo."


### Tool: `listSupportedFeeds`

- **Description**: Returns a Markdown list of all supported chains and their price feed names.

- **Parameters**: None.

- **Natural Language Example (Claude Desktop)**:
 
  > **Input**: "Can you list all the price feeds supported by the server?"
  
  > **Output**: "Here are the supported price feeds by chain:
    - Ethereum: FIL/ETH, FDUSD/USD, UNI/ETH, ...
    - BNB Chain: DOT/USD, CAKE/USD, BUSD/BNB, ...
    - Base: AXL/USD, USDC/USD, WIF/USD, ...
    - Starknet: ETH/USD, BTC/USD, WSTETH/ETH, ...
    - Linea: ETH/USD, FOXY/USD, MATIC/USD, ...
    - Mantle: MNT/USD, USDT/USD, BTC/USD, ...
    - Scroll: SCR/USD, STETH/USD, WBTC/BTC, ...
    - zkSync: ZK/USD, PEPE/USD, TRUMP/USD, ...
    - Celo: CELO/USD, CUSD/USD, NGN/USD, ..."


### Tool: `listSupportedFeedsByChain`

- **Description**: Returns a comma-separated list of price feed names for a specified blockchain network.

- **Parameters**:
  - `chain` (string): The blockchain network, e.g., `base`.

- **Natural Language Example (Claude Desktop)**:
  > **Input**:  "What price feeds are available on the Base chain?"
  
  > **Output**: "The Base chain supports the following price feeds: AXL/USD, USDC/USD, WIF/USD, CBETH/ETH, ..."


## License

This project is licensed under the [MIT License](LICENSE).

