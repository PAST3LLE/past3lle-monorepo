/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Contract, ContractFactory } from '@ethersproject/contracts'
import {
  Collection__factory as Collection,
  CollectionsManager__factory as CollectionsManager
} from '@past3lle/skilltree-contracts'
import inquirer from 'inquirer'

import { networksToChainId } from './constants/chains'
import { ContractNames, SupportedNetworks } from './types/networks'
import { getConfig } from './utils/getConfig'
import { getFeeData } from './utils/getFeeData'
import { getNetworksJson } from './utils/getNetworksJson'
import { getWalletInfo } from './utils/getWalletInfo'
import { logFormattedTxInfo } from './utils/logFormattedTxInfo'
import { writeNetworks } from './utils/writeNetworks'

async function deployCollectionAndAddToManager(props?: { tryHigherValues: boolean }): Promise<void> {
  const { networks: networksMap, mnemonic: configMnemonic } = await getConfig()

  if (!networksMap) {
    throw new Error(
      '[Forge-CLI] No networks map detected. Check script signature if passing via function call otherwise .env NETWORKS_URL_MAP'
    )
  }

  // Prompt for user input
  const initialPromptAnswer = await inquirer.prompt([
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
        if (!input?.startsWith('/')) return 'Custom sub-path must start with a "/"'
        if (!input?.endsWith('/')) return 'Custom sub-path must end with a "/"'
        return true
      }
    }
  ])

  const network = initialPromptAnswer.network as SupportedNetworks
  const idFromNetworkAnswer = networksToChainId?.[network]
  const networksJson = await getNetworksJson()

  const collectionsManagerAddr = networksJson?.[idFromNetworkAnswer]?.CollectionsManager?.address
  if (!collectionsManagerAddr) {
    console.log(`
    _  _ ___   _   ___  ___   _   _ __  _ 
    | || | __| /_\\ |   \\/ __| | | | | _ \\ |
    | __ | _| / _ \\| |) \\__ \\ | |_| |  _/_|
    |_||_|___/_/ \\_\\___/|___/  \\___/|_| (_)

    WARNING!
    No CollectionsManager forge-networks.json information found! 
    
    Either deploy a new CollectionsManager via the CLI > deployCollectionsManager
    
    OR
    
    Write new networks using an existing address via the CLI > writeNetworks

    Exiting CLI.

    `)
    process.exit(0)
  }

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'mnemonic',
      message: 'Enter mnemonic phrase or leave empty if you want to use the forge.config value:'
    },
    {
      type: 'input',
      name: 'metadataUri',
      message: `Enter your Collection metadata folder uri -
      
  Examples: 
  1. ipfs://someHash/
  2. https://some-collection-name.s3.eu-south-7.amazonaws.com/collections/99/
        
  NOTE: Using IPFS urls (ipfs://) are recommended as it provides an immutable url.

  URL must point to a folder containing each collection's skills metadata information.
  It MUST also end with a trailing slash, like in the examples above.

Metadata URI:`,
      validate(input: string | null | undefined) {
        const isString = typeof input === 'string'
        const hasLength = isString && input?.length && input.length > 0
        const endsWithSlash = isString && input?.endsWith('/')

        const isValid = hasLength && isString && endsWithSlash

        if (isValid) {
          return true
        }

        throw Error('Please provide a valid metadata uri.')
      }
    },
    {
      type: 'input',
      name: 'collectionName',
      message: 'Enter your Collection name',
      validate(input: string | null | undefined) {
        if (typeof input === 'string' && input?.length && input.length > 0) {
          return true
        }

        throw Error('Please provide a valid collection name.')
      }
    }
  ])

  const { mnemonic: cliMnemonic, metadataUri, collectionName } = answers

  const mnemonic: string | undefined = cliMnemonic || configMnemonic
  if (!mnemonic) {
    throw new Error('[Forge-CLI] No mnemonic detected. Check forge.config or CLI params if using them.')
  }

  const rpcUrl = networksMap?.[network].rpcUrl
  const chainId = networksMap?.[network].id
  if (!rpcUrl)
    throw new Error(
      '[Forge-CLI] No rpcUrl found for network ' + network + '. Please check forge.config networks settings'
    )
  if (!chainId)
    throw new Error(
      '[Forge-CLI] No chainId found for network ' + network + '. Please check forge.config networks settings'
    )
  const { wallet, provider } = getWalletInfo({ rpcUrl, mnemonic })

  console.log(`
      
  Configuration submitted. Deploying Collection.sol to ${network} with the following parameters:
  
  MNEMONIC: ******
  RPC URL: ${rpcUrl}
  
  METADATA URI: ${metadataUri}
  NAME: ${collectionName}
  COLLECTIONS MANAGER ADDRESS: ${collectionsManagerAddr}

  Please wait...

  `)

  // Get Collection contract instance
  const CollectionsManagerContract = new Contract(collectionsManagerAddr, CollectionsManager.abi, wallet)

  // Load the contract's bytecode and ABI
  const collectionAbi = Collection.abi
  const collection = Collection.bytecode

  const factory = new ContractFactory(collectionAbi, collection, wallet)

  const constructorArgs = [metadataUri, collectionName, collectionsManagerAddr]

  // gas cost estimation
  const deploymentData = factory.interface.encodeDeploy(constructorArgs)
  const estimatedGas = await wallet.estimateGas({ data: deploymentData }).catch(() => {
    //ignore
  })
  estimatedGas && console.log('COLLECTION.SOL DEPLOYMENT GAS ESTIMATION:', estimatedGas.toString())

  const feeData = await getFeeData(network, props?.tryHigherValues)

  try {
    // Deploy the contract
    const collectionContract = await factory.deploy(...constructorArgs, feeData)

    // Wait for the deployment transaction to be mined
    await collectionContract.deployed()
    console.log('[Forge-CLI] Collection.sol contract deployed at address:', collectionContract.address)

    const collectionsManager = CollectionsManagerContract.attach(collectionsManagerAddr)
    // Add a new collection to CollectionsManager
    const txInfo = await collectionsManager
      .addCollection(collectionContract.address, feeData)
      .catch((error: Error | string) => {
        console.error('[Forge-CLI] Error adding new collection to manager! Error: ', error)
        throw new Error(typeof error !== 'string' ? error?.message : error)
      })
    console.log('[Forge-CLI] CollectionsManager addCollection txInfo:', logFormattedTxInfo(txInfo))
    const collectionId: number = (await collectionsManager.totalSupply()).toNumber()
    console.log(
      '[Forge-CLI] Added new collection into CollectionsManager.sol! Collections.sol address:',
      collectionContract.address,
      ' With ID inside CollectionsManager:',
      collectionId
    )

    await writeNetworks({
      // SOL contract name
      contract: ('Collection-' + (collectionId + 1)) as ContractNames,
      // deployed contract addr
      newAddress: collectionContract.address,
      // deployed txHash
      transactionHash: collectionContract.deployTransaction.hash,
      chainId: provider.network.chainId,
      // network string name (e.g amoy)
      network: provider.network.name,
      customSubPath: initialPromptAnswer?.customSubPath
    })
  } catch (error) {
    console.log(`
    _  _ ___   _   ___  ___   _   _ __  _ 
    | || | __| /_\\ |   \\/ __| | | | | _ \\ |
    | __ | _| / _ \\| |) \\__ \\ | |_| |  _/_|
    |_||_|___/_/ \\_\\___/|___/  \\___/|_| (_)

    ERROR!
    An error occurred while deploying a new Collection.sol contract and/or trying to attach it to the CollectionsManager.sol contract! Error message (if any):

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
      await deployCollectionAndAddToManager({ tryHigherValues: true })
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
  deployCollectionAndAddToManager()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
