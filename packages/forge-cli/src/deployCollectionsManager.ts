import { ContractFactory } from '@ethersproject/contracts'
import { CollectionsManager__factory as CollectionsManager } from '@past3lle/skilltree-contracts'
import dotEnv from 'dotenv'
import inquirer from 'inquirer'

import deployCollectionAndAddToManager from './deployCollectionAndAddToManager'
import { SupportedNetworks } from './types/networks'
import { getConfig } from './utils/getConfig'
import { getFeeData } from './utils/getFeeData'
import { getWalletInfo } from './utils/getWalletInfo'
import { writeNetworks } from './utils/writeNetworks'

dotEnv.config()

async function deployCollectionsManager(props?: { tryHigherValues: boolean }): Promise<void> {
  const { networks: networksMap, mnemonic: configMnemonic } = await getConfig()

  if (!networksMap) {
    throw new Error(
      '[Forge-CLI] No networks map detected. Check script signature if passing via function call otherwise .env NETWORKS_URL_MAP'
    )
  }
  // Prompt for user input
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select a network',
      choices: Object.keys(networksMap).map((network) => ({ name: network, value: network }))
    },
    {
      type: 'input',
      name: 'customSubPath',
      message: `(Optional) Enter a custom sub-path to read/write networks from/to -
  
  Example: "/json/misc/" would resolve to: "${process.cwd()}/json/misc/forge-networks.json"
  
  Defaults root folder: "${process.cwd()}/forge-networks.json"
  
  Custom sub-path:`,
      default: '',
      validate: (input: string | undefined | null) => {
        if (input === '' || input === undefined || input === null) return true
        if (!input.startsWith('/')) return 'Custom sub-path must start with a "/"'
        if (!input.endsWith('/')) return 'Custom sub-path must end with a "/"'
        return true
      }
    },
    {
      type: 'password',
      name: 'mnemonic',
      message: 'Enter mnemonic phrase or leave empty if you want to use the forge.config value:'
    },
    {
      type: 'input',
      name: 'metadataUri',
      message: `Enter your CollectionsManager metadata folder uri -
      
  Example: ipfs://someHash/ or https://s3.somebucket.url.thing.com/collections/
      
  This URL must point to a FOLDER containing each collection(s) metadata information.
  It MUST also end with a trailing slash, like in the examples above.

Metadata folder URI:`,
      validate(input: string | null | undefined) {
        if (typeof input === 'string' && input.length > 0 && input.endsWith('/')) {
          return true
        }

        throw Error('Please provide a valid metadata uri.')
      }
    }
  ])

  const {
    network,
    mnemonic: cliMnemonic,
    metadataUri
  } = answers as { network: SupportedNetworks; mnemonic: string | undefined; metadataUri: string }

  const mnemonic: string | undefined = cliMnemonic || configMnemonic
  if (!mnemonic) throw new Error('[Forge-CLI] Please set your MNEMONIC correctly in forge.config or in the CLI prompt')

  const rpcUrl = networksMap?.[network]?.rpcUrl
  if (!rpcUrl)
    throw new Error(
      '[Forge-CLI] No rpcUrl found for network ' +
        network +
        ". Please check the network's forge.config.js rpcUrl value."
    )

  console.log(`
      
  Configuration submitted. Deploying CollectionsManager.sol to ${network} with the following parameters:

  MNEMONIC: ******
  RPC URL: ${rpcUrl}
  
  METADATA URI: ${metadataUri}

  Please wait...

  `)

  const { wallet, provider } = getWalletInfo({ rpcUrl, mnemonic })

  // Create a contract factory
  const factory = new ContractFactory(CollectionsManager.abi, CollectionsManager.bytecode, wallet)

  const constructorArgs = [metadataUri]

  const feeData = await getFeeData(network, props?.tryHigherValues)

  try {
    // Deploy the contract
    const contract = await factory.deploy(...constructorArgs, feeData)

    // Wait for the deployment transaction to be mined
    await contract.deployed()
    console.log('[Forge-CLI] CollectionsManager.sol deployed at address:', contract.address)

    await writeNetworks({
      // SOL contract name
      contract: 'CollectionsManager',
      // deployed contract addr
      newAddress: contract.address,
      // deployed txHash
      transactionHash: contract.deployTransaction.hash,
      chainId: provider.network.chainId,
      // network string name (e.g amoy)
      network: provider.network.name
    })
  } catch (error) {
    console.log(`
    _  _ ___   _   ___  ___   _   _ __  _ 
    | || | __| /_\\ |   \\/ __| | | | | _ \\ |
    | __ | _| / _ \\| |) \\__ \\ | |_| |  _/_|
    |_||_|___/_/ \\_\\___/|___/  \\___/|_| (_)

    ERROR!
    An error occurred while deploying a new CollectionsManager.sol contract! Error message (if any):

    ==========================
    ${error instanceof Error && 'message' in error ? error.message : 'N/A'}
    ==========================
    
    Confirm below to try again with higher gas fees as this is likely a network congestion issue.
    `)

    const confirmation = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'retry',
        message: 'Do you wish to retry with 12% higher gas fees?'
      }
    ])

    if (confirmation.retry) {
      console.log('[Forge-CLI] Retrying with 12% increased gas fees.')
      await deployCollectionsManager({ tryHigherValues: true })
    } else {
      throw error
    }
  }

  const confirmation = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: 'Do you wish to deply and add a new Collection to the CollectionsManager contract?'
    }
  ])

  if (!confirmation.continue) {
    console.log('[Forge-CLI] Exiting CLI.')
    process.exit(0)
  }

  await deployCollectionAndAddToManager()
}

export default async () =>
  deployCollectionsManager()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
