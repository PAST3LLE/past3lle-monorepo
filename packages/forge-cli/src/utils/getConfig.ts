/* eslint-disable */
import { promises as fs } from 'fs'
import inquirer from 'inquirer'
import path from 'path'

import { ForgeConfig } from '../types/networks'

const DEFAULT_CONFIG: ForgeConfig = {
  networks: {
    mainnet: {
      id: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/INSERT_INFURA_KEY_HERE'
    },
    sepolia: {
      id: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/INSERT_INFURA_KEY_HERE'
    },
    amoy: {
      id: 80002,
      rpcUrl: 'https://rpc-amoy.maticvigil.com/v1/INSERT_MATIC_VIGIL_KEY_HERE'
    },
    matic: {
      id: 137,
      rpcUrl: 'https://rpc-mainnet.maticvigil.com/v1/INSERT_MATIC_VIGIL_KEY_HERE'
    },
    polygon: {
      id: 137,
      rpcUrl: 'https://rpc-mainnet.maticvigil.com/v1/INSERT_MATIC_VIGIL_KEY_HERE'
    }
  },
  mnemonic: 'test test test test test',
  etherscanApiKey: 'INSERT_ETHERSCAN_API_KEY_HERE'
}

const CONFIG_PATH = path.join(process.cwd(), '/forge.config.js')
export async function getConfig() {
  let config = DEFAULT_CONFIG
  try {
    config = await import(CONFIG_PATH)
  } catch (error) {
    await createDefaultConfigFile()

    console.log(`
     _  _ ___   _   ___  ___   _   _ __  _ 
    | || | __| /_\\ |   \\/ __| | | | | _ \\ |
    | __ | _| / _ \\| |) \\__ \\ | |_| |  _/_|
    |_||_|___/_/ \\_\\___/|___/  \\___/|_| (_)
    
    WARNING!
    No "forge.config.js" file found in the current directory root: ${process.cwd()}. 
    We created a default config file for you, which you can edit to fit your needs by exiting the CLI. 
    The CLI will continue using the default forge.config.js file which reads from the following environment variables:
    
    1. MNEMONIC: your mnemonic phrase for signing deployment transactions
    2. <NETWORK>_RPC_URL: <network> RPC urls for each network
    
    If any of these env variables are missing, the CLI will throw an error and exit.
    
  `)

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Do you wish to continue using the default forge.config.js?'
      }
    ])

    if (!answers.continue) {
      console.log('[Forge-CLI] Exiting CLI.')
      process.exit(0)
    }

    console.log('[Forge-CLI] Continuing with default forge.config.js file.')

    config = await import(CONFIG_PATH)
  }

  if (!config?.networks) {
    throw new Error(
      '[Forge-CLI] No networks detected. Check that your networks object inside forge.config.js is correct.'
    )
  }
  if (!config?.mnemonic) {
    throw new Error(
      '[Forge-CLI] No mnemonic detected. Check that your mnemonic string inside forge.config.js is correct.'
    )
  }

  return {
    networks: config.networks,
    mnemonic: config.mnemonic,
    etherscanApiKey: config.etherscanApiKey
  }
}

async function createDefaultConfigFile() {
  const configFileContent = `module.exports = {
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
`

  try {
    await fs.writeFile(CONFIG_PATH, configFileContent)
  } catch (error) {
    throw new Error('[Forge-CLI] Error creating config file:' + error)
  }
}
