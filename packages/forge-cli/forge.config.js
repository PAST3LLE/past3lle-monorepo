module.exports = {
  networks: {
    sepolia: {
      id: 11155111,
      rpcUrl: process.env.SEPOLIA_RPC_URL
    },
    matic: {
      id: 137,
      rpcUrl: process.env.POLYGON_RPC_URL
    },
    amoy: {
      id: 80002,
      rpcUrl: process.env.ALCHEMY_RPC_URL
    }
  },
  mnemonic: process.env.MNEMONIC,
  etherscanApiKey: process.env.ETHERSCAN_API_KEY
}
