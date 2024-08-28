import dotEnv from 'dotenv'
import inquirer from 'inquirer'

import { networksToChainId } from './constants/chains'
import { SupportedNetworks } from './types/networks'
import { getConfig } from './utils/getConfig'
import { writeNetworks } from './utils/writeNetworks'

dotEnv.config()

async function writeUpdatedNetworks(): Promise<void> {
  const { networks } = await getConfig()
  // Prompt for user input
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select a network',
      choices: Object.keys(networks).map((network) => ({ name: network, value: network }))
    },
    {
      type: 'input',
      name: 'customSubPath',
      message: `(Optional) Enter a custom sub-path to read/write networks from/to -
  
  Example: "/json/misc/" would resolve to: "${process.cwd()}/json/misc/forge-networks.json"
  
  Defaults root folder: "${process.cwd()}/forge-networks.json"
  
  Custom sub-path:`,
      default: '',
      validate: (input: unknown) => {
        if (typeof input === 'string') {
          if (!input.startsWith('/')) return 'Custom sub-path must start with a "/"'
          if (!input.endsWith('/')) return 'Custom sub-path must end with a "/"'
        }
        return true
      }
    },
    {
      type: 'list',
      name: 'contractName',
      message: 'Select a contract for which to make updates:',
      choices: [
        {
          name: 'CollectionsManager',
          value: 'CollectionsManager',
          description: 'CollectionsManager contract'
        }
      ]
    },
    {
      type: 'input',
      name: 'newAddress',
      message: 'Enter CollectionsManager address to update forge-networks.json file with'
    },
    {
      type: 'input',
      name: 'transactionHash',
      message: 'Enter transactionHash of deployed contract or leave blank'
    }
  ])

  const { contractName, newAddress, transactionHash, network, customSubPath } = answers as {
    contractName: 'CollectionsManager'
    network: string
    newAddress: string
    transactionHash: string | undefined
    customSubPath?: string
  }

  const chainId =
    networks?.[network as SupportedNetworks]?.id || (networksToChainId as Record<string, number>)?.[network]
  if (!chainId)
    throw new Error('[Forge-CLI] ChainId not found for network ' + network + '. Please check forge-networks.json')

  await writeNetworks({
    // SOL contract name
    contract: contractName,
    // deployed contract addr
    newAddress,
    // deployed txHash
    transactionHash,
    chainId,
    // network string name (e.g amoy)
    network,
    customSubPath
  })

  const confirmation = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Do you wish to write more networks?'
    }
  ])

  if (!confirmation.continue) {
    console.log('[Forge-CLI] Exiting CLI.')
    process.exit(0)
  }

  await writeUpdatedNetworks()
}

export default async () =>
  writeUpdatedNetworks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
