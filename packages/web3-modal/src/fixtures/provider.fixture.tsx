import { ButtonVariations, ColumnCenter, PstlButton, RowCenter, SpinnerCircle } from '@past3lle/components'
import { ThemeProvider, createCustomTheme } from '@past3lle/theme'
import { getExpirementalCookieStore as getCookieStore, truncateLongString } from '@past3lle/utils'
import { ledgerHid } from '@past3lle/wagmi-connectors'
import { config } from 'dotenv'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import { Address, http, parseEther } from 'viem'
import { mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains'
import { ConnectorNotFoundError, useBalance, useSendTransaction } from 'wagmi'
import { injected } from 'wagmi/connectors'

import { TransactionsButton } from '../components/buttons/Transactions'
import { RouterCtrl } from '../controllers'
import { DEFAULT_TX } from '../controllers/TransactionsCtrl'
import { RouterView } from '../controllers/types'
import { useModalActions, usePstlWeb3Modal, useUserConnectionInfo } from '../hooks'
import { useLimitChainsAndSwitchCallback } from '../hooks/api/useLimitChainsAndSwitchCallback'
import {
  useAddPendingTransaction,
  useTransactions,
  useUpdateTransactionsViaCallback
} from '../hooks/api/useTransactions'
import { PstlW3Providers } from '../providers'
import { createTheme } from '../theme'
import { COMMON_CONNECTOR_OVERRIDES, DEFAULT_PROPS, DEFAULT_PROPS_WEB3AUTH, pstlModalTheme } from './config'
import { INJECTED_CONNECTORS, wagmiConnectors } from './connectorsAndPlugins'

config()

const IS_SERVER = typeof globalThis?.window === 'undefined'

interface Web3ButtonProps {
  children?: ReactNode
}
const Web3Button = ({ children = <div>Show PSTL Wallet Modal</div> }: Web3ButtonProps) => {
  const { onAccountClick } = useModalActions()
  const { address, connector } = useUserConnectionInfo()

  if (!IS_SERVER && !!connector && !(window as any)?.__PSTL_CONNECTOR) {
    ;(window as any).__PSTL_CONNECTOR = connector
  }

  return (
    <ColumnCenter>
      <PstlButton buttonVariant={ButtonVariations.PRIMARY} onClick={onAccountClick}>
        {children}
      </PstlButton>
      <br />
      <br />
      <TransactionsButton
        background="linear-gradient(300deg, rgba(0 0 0 / 0.97) 70%, pink)"
        color="ghostwhite"
        fontFamily="Roboto Flex,monospace,arial"
        fontSize="1.5em"
        fontWeight={100}
        letterSpacing="-1.5px"
        transitionTime={500}
      >
        View Transactions
      </TransactionsButton>

      <h3>Connected to {address || 'DISCONNECTED!'}</h3>
      <h3>Connector: {connector?.id}</h3>
    </ColumnCenter>
  )
}

function DefaultApp() {
  const topLevelTheme = useTheme()

  if (!topLevelTheme) console.debug('No top level theme DefaultApp')

  return <InnerApp />
}

function InnerApp() {
  const { setMode, mode } = useTheme()
  const derivedConfig = Object.assign({}, DEFAULT_PROPS_WEB3AUTH)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  derivedConfig!.modals!.root!.themeConfig!.mode = mode
  return (
    <PstlW3Providers config={derivedConfig}>
      <AppWithWagmiAccess />
      <h1>MODE: {mode}</h1>
      <button onClick={() => setMode(mode === 'LIGHT' ? 'DARK' : 'LIGHT')}>Change theme mode</button>
      <button onClick={() => setMode('DEFAULT')}>Revert to default</button>
      <Web3Button />
    </PstlW3Providers>
  )
}

function AppWithWagmiAccess() {
  const { address } = useUserConnectionInfo()
  const { data, refetch } = useBalance({ address })
  const [sendEthVal, setSendEthVal] = useState('0')
  const [addressToSendTo, setAddress] = useState<Address | undefined>()

  const sendApi = useSendTransaction()

  const addPendingTransaction = useAddPendingTransaction()
  const { transactions: allTransactions } = useTransactions()

  const [currentTx, setTx] = useState('')
  const handleSendTransaction = useCallback(
    async (args: Parameters<ReturnType<typeof useSendTransaction>['sendTransaction']>[0]) => {
      setTx('pending')
      sendApi
        .sendTransactionAsync(args)
        .then((tx) => {
          setTx(tx)
          addPendingTransaction(tx)
        })
        .catch((error) => {
          throw error
        })
        .finally(() => {
          setTx('')
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendApi]
  )

  const status = allTransactions?.find((pTx) => pTx.transactionHash === currentTx)?.status

  useEffect(() => {
    // @ts-ignore
    document.body.style = 'background: #050b2e; color: ghostwhite;'
  }, [])

  return (
    <>
      <h1>Here has wagmi access</h1>
      <p>Address: {address}</p>
      <button onClick={() => refetch()}>Get balance</button>
      <p>Balance: {data?.formatted}</p>
      <br />

      <p>Send ETH</p>
      <>
        {!!currentTx && status !== 'success' && (
          <RowCenter width="300px" gap="1rem">
            <h4>TX {currentTx} in progress...</h4>
            <SpinnerCircle filter="invert(1)" size={100} />
          </RowCenter>
        )}
      </>

      <>
        <p>
          Amount
          <input type="text" value={sendEthVal} onChange={(e: any) => setSendEthVal(e.target.value)} />
        </p>
        <p>
          To
          <input type="text" value={addressToSendTo} onChange={(e: any) => setAddress(e.target.value)} />
        </p>
        <button
          onClick={() =>
            addressToSendTo && handleSendTransaction({ value: parseEther(sendEthVal), to: addressToSendTo })
          }
        >
          Send to {addressToSendTo || 'N/A'}
        </button>
      </>
    </>
  )
}

function Updater() {
  useEffect(() => {
    if (IS_SERVER) return
    window.document.body.setAttribute('style', `font-family: system-ui;`)
  }, [])
  return null
}
const THEME = createCustomTheme({
  modes: {
    LIGHT: {
      header: 'white'
    },
    DARK: {
      header: 'black'
    },
    DEFAULT: {
      header: 'red'
    }
  }
})
const withThemeProvider = (Component: () => JSX.Element | null) => (
  <div style={{ fontFamily: 'system-ui' }}>
    <ThemeProvider theme={THEME}>
      <Updater />
      <Component />
    </ThemeProvider>
  </div>
)

export default {
  List__Web3Modal: withThemeProvider(() => <DefaultApp />),
  List__WalletConnectMetaMaskHidden: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        chains: [mainnet],
        clients: {
          wagmi: {
            options: {
              transports: {
                1: http('https://mainnet.infura.io/v3/5f5d6fa3fcd249f288a5aa36d2337914'),
                11155111: http('https://sepolia.infura.io/v3/5f5d6fa3fcd249f288a5aa36d2337914'),
                137: http('https://polygon-mainnet.infura.io/v3/5f5d6fa3fcd249f288a5aa36d2337914'),
                80002: http('https://polygon-amoy.infura.io/v3/5f5d6fa3fcd249f288a5aa36d2337914')
              }
            }
          }
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            hideInjectedFromRoot: true
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  List__WalletConnectUnknownInjected: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            hideInjectedFromRoot: false
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  List__LedgerLiveWalletConnect: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        connectors: {
          // connectors: [wagmiConnectors.ledgerLiveModal],
          overrides: {
            ...COMMON_CONNECTOR_OVERRIDES,
            ledger: {
              customName: 'LEDGER LIVE',
              logo: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
              modalNodeId: 'ModalWrapper',
              rank: 10,
              isRecommended: true
            }
          }
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            hideInjectedFromRoot: true
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  Grid__AllWithLedgerLive: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS_WEB3AUTH,
        connectors: {
          connectors: [
            // wagmiConnectors.ledgerLiveModal,
            wagmiConnectors.web3auth
          ],
          overrides: COMMON_CONNECTOR_OVERRIDES
        },
        modals: {
          ...DEFAULT_PROPS_WEB3AUTH.modals,
          root: {
            ...DEFAULT_PROPS_WEB3AUTH.modals.root,
            walletsView: 'grid',
            width: '640px',
            maxWidth: '100%',
            maxHeight: '550px',
            hideInjectedFromRoot: false
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  Grid__SizeDefaults: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        connectors: {
          connectors: [
            ledgerHid({
              shimDisconnect: true,
              async onDeviceDisconnect() {
                alert('Disconnected ledger!')
              }
            })
          ],
          overrides: COMMON_CONNECTOR_OVERRIDES
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            walletsView: 'grid',
            hideInjectedFromRoot: false
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  List__SizeDefaults: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        connectors: {
          // connectors: [wagmiConnectors.ledgerLiveModal, wagmiConnectors.ledgerHID],
          overrides: COMMON_CONNECTOR_OVERRIDES
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            walletsView: 'list'
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  List__MetaMaskFirstLedgerSecond: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        connectors: {
          connectors: [
            injected({
              target() {
                if (IS_SERVER) return undefined
                return {
                  name: 'Coinbase Wallet',
                  id: 'coinbase-injected',
                  provider: window?.ethereum?.isCoinbaseWallet
                    ? window.ethereum.providerMap?.get('CoinbaseWallet')
                    : window?.coinbaseWalletExtension
                }
              }
            })
          ],
          overrides: COMMON_CONNECTOR_OVERRIDES
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            walletsView: 'list',
            hideInjectedFromRoot: false,
            loaderProps: {
              containerProps: {
                borderRadius: '10px'
              },
              spinnerProps: {
                size: 80,
                filter: 'saturate(15) hue-rotate(100deg)'
              },
              loadingText: 'FETCHING INFO...'
            }
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  List__LedgerAutoClose: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        ...DEFAULT_PROPS,
        connectors: {
          // connectors: [wagmiConnectors.ledgerLiveModal],
          overrides: {
            ...COMMON_CONNECTOR_OVERRIDES,
            ledger: {
              customName: 'LEDGER LIVE',
              logo: 'https://crypto-central.io/library/uploads/Ledger-Logo-3.png',
              modalNodeId: 'ModalWrapper',
              rank: 10,
              isRecommended: true
            }
          }
        },
        modals: {
          ...DEFAULT_PROPS.modals,
          root: {
            ...DEFAULT_PROPS.modals.root,
            closeModalOnConnect: true,
            walletsView: 'list',
            hideInjectedFromRoot: true,
            loaderProps: {
              containerProps: {
                borderRadius: '10px'
              },
              spinnerProps: {
                size: 80,
                filter: 'saturate(15) hue-rotate(100deg)'
              },
              loadingText: 'FETCHING INFO...'
            }
          }
        }
      }}
    >
      <AppWithWagmiAccess />
      <Web3Button />
    </PstlW3Providers>
  )),
  Grid__LedgerHID: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS,
          connectors: {
            connectors: [
              wagmiConnectors.ledgerHID
              // wagmiConnectors.ledgerLiveModal
            ],
            overrides: COMMON_CONNECTOR_OVERRIDES
          },
          modals: {
            ...DEFAULT_PROPS.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  Grid__ManyInjected: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS,
          // chains: [DEFAULT_PROPS.chains[0]],
          connectors: {
            connectors: INJECTED_CONNECTORS,
            overrides: COMMON_CONNECTOR_OVERRIDES
          },
          modals: {
            ...DEFAULT_PROPS.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  Grid__ManyInjectedAndLedger: withThemeProvider(() => {
    return (
      <PstlW3Providers
        autoReconnect
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          connectors: {
            connectors: [ledgerHid(), ...INJECTED_CONNECTORS],
            overrides: {
              ...COMMON_CONNECTOR_OVERRIDES,
              'ledger-hid': {
                ...COMMON_CONNECTOR_OVERRIDES['ledger-hid'],
                async customConnect({ modalsStore: store, connector, wagmiConnect }) {
                  if (!connector) throw new ConnectorNotFoundError()
                  await wagmiConnect(connector)

                  return store.open({ route: 'HidDeviceOptions' })
                }
              }
            }
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              maxWidth: '650px',
              minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  filter: 'invert(1) saturate(0.8) hue-rotate(207deg) brightness(10)',
                  size: 90,
                  src: 'https://e7.pngegg.com/pngimages/599/45/png-clipart-computer-icons-loading-chart-hand-circle.png',
                  strokeWidth: 0.55
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  List__ManyInjectedAndLedger: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: {
              ...COMMON_CONNECTOR_OVERRIDES,
              'ledger-hid': {
                ...COMMON_CONNECTOR_OVERRIDES['ledger-hid'],
                async customConnect({ modalsStore: store, connector, wagmiConnect }) {
                  if (!connector) throw new ConnectorNotFoundError()
                  await wagmiConnect(connector)

                  return store.open({ route: 'HidDeviceOptions' })
                }
              }
            }
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'list',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  List__AutoSwitchChainFromURL: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          callbacks: {
            switchChain: async (chains) => {
              // IFrame so we need to do this
              const search = window?.top?.location.search
              const chainParam = Number(new URLSearchParams(search).get('cosmos-network') || 0)

              return chains.filter((chain) => chain.id === chainParam)[0]
            }
          },
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: COMMON_CONNECTOR_OVERRIDES
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'list',
              // maxWidth: '650px',
              // minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  List__AutoSwitchChainFromCookies: withThemeProvider(() => {
    const COOKIE_KEY = 'cosmos-chain'
    const COOKIE_VALUE = '137'

    useEffect(() => {
      getCookieStore()
        ?.get(COOKIE_KEY)
        .then((cookie?: { value: string }) => {
          console.debug('COOKIE CURRENTLY SET', cookie)
          if (cookie?.value !== COOKIE_VALUE) {
            getCookieStore().set(COOKIE_KEY, COOKIE_VALUE)
            window.location.reload()
          }
        })
    }, [])

    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          callbacks: {
            switchChain: async (chains) => {
              // IFrame so we need to do this
              const networkCookie = (await getCookieStore()?.get(COOKIE_KEY))?.value || 0

              return chains.find((chain) => chain.id === Number(networkCookie))
            }
          },
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: COMMON_CONNECTOR_OVERRIDES
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'list',
              // maxWidth: '650px',
              // minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  Grid__ChainsFiltering: withThemeProvider(() => {
    const HARD_ENVIRONMENT_PARAM = 'hard-env'
    const SOFT_ENVIRONMENT_PARAM = 'soft-env'
    const limitChains = useLimitChainsAndSwitchCallback()
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          callbacks: {
            softLimitChains: (chains) => {
              const searchParams = new URLSearchParams(window?.top?.location.search)
              if (searchParams.get(SOFT_ENVIRONMENT_PARAM) === 'prod') {
                return [mainnet]
              } else if (searchParams.get(SOFT_ENVIRONMENT_PARAM) === 'dev') {
                return [mainnet, sepolia, polygon]
              } else {
                return chains
              }
            },
            hardLimitChains: (chains) => {
              const searchParams = new URLSearchParams(window?.top?.location.search)
              if (searchParams.get(HARD_ENVIRONMENT_PARAM) === 'prod') {
                return [mainnet]
              } else if (searchParams.get(HARD_ENVIRONMENT_PARAM) === 'dev') {
                return [mainnet, sepolia, polygon]
              } else {
                return chains
              }
            }
          },
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: COMMON_CONNECTOR_OVERRIDES
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          },
          clients: {
            wagmi: {
              options: {
                ...DEFAULT_PROPS_WEB3AUTH.clients?.wagmi?.options,
                transports: {
                  1: http(`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`),
                  11155111: http(`https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`),
                  137: http(`https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`),
                  80002: http(`https://polygon-amoy.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`)
                }
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
        <button onClick={() => limitChains([mainnet])}>Limit chains to just MAINNET</button>
        <button onClick={() => limitChains([sepolia])}>Limit chains to just SEPOLIA</button>
        <button onClick={() => limitChains([polygonAmoy])}>Limit chains to just AMOY</button>
      </PstlW3Providers>
    )
  }),
  Grid__CloseOnEscapeKey: withThemeProvider(() => {
    const { mode, setMode } = useTheme()
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          options: {
            ...DEFAULT_PROPS_WEB3AUTH.options,
            closeModalOnKeys: ['Escape', 'Esc']
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              themeConfig: {
                theme: pstlModalTheme,
                mode
              },
              closeModalOnConnect: true,
              openType: 'root',
              walletsView: 'grid',
              maxWidth: '650px',
              minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
        Theme: {mode}
        <button onClick={() => setMode(mode === 'LIGHT' ? 'DARK' : 'LIGHT')}>Change theme mode</button>
        <button onClick={() => setMode('DEFAULT')}>Revert to default</button>
      </PstlW3Providers>
    )
  }),
  Grid__LedgerDeviceConfigChoice: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, wagmiConnectors.ledgerLiveModal, wagmiConnectors.web3auth],
            overrides: {
              'ledger-hid': {
                ...COMMON_CONNECTOR_OVERRIDES['ledger-hid'],
                async customConnect({ modalsStore: store, connector, wagmiConnect }) {
                  if (!connector) throw new ConnectorNotFoundError()
                  await wagmiConnect(connector)

                  return store.open({ route: 'ConnectorConfigType' })
                }
              }
            }
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  HIDDeviceModal: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: {
              ...COMMON_CONNECTOR_OVERRIDES,
              'ledger-hid': {
                ...COMMON_CONNECTOR_OVERRIDES['ledger-hid'],
                async customConnect({ modalsStore: store, connector, wagmiConnect }) {
                  if (!connector) throw new ConnectorNotFoundError()
                  await wagmiConnect(connector)

                  return store.open({ route: 'HidDeviceOptions' })
                }
              }
            }
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              maxWidth: '650px',
              minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <ModalOpenButton />
      </PstlW3Providers>
    )
  }),
  HIDConfigChoiceModal: withThemeProvider(() => {
    return (
      <PstlW3Providers
        config={{
          ...DEFAULT_PROPS_WEB3AUTH,
          connectors: {
            connectors: [wagmiConnectors.ledgerHID, ...INJECTED_CONNECTORS],
            overrides: {
              ...COMMON_CONNECTOR_OVERRIDES,
              'ledger-hid': {
                ...COMMON_CONNECTOR_OVERRIDES['ledger-hid'],
                async customConnect({ modalsStore: store, connector, wagmiConnect }) {
                  if (!connector) throw new ConnectorNotFoundError()
                  await wagmiConnect(connector)

                  return store.open({ route: 'ConnectorConfigType' })
                }
              }
            }
          },
          modals: {
            ...DEFAULT_PROPS_WEB3AUTH.modals,
            root: {
              ...DEFAULT_PROPS.modals.root,
              closeModalOnConnect: true,
              walletsView: 'grid',
              maxWidth: '650px',
              minHeight: '600px',
              hideInjectedFromRoot: false,
              loaderProps: {
                fontSize: '3.2em',
                containerProps: {
                  borderRadius: '10px'
                },
                spinnerProps: {
                  size: 80,
                  filter: 'saturate(15) hue-rotate(100deg)'
                },
                loadingText: 'FETCHING INFO...'
              }
            }
          }
        }}
      >
        <AppWithWagmiAccess />
        <Web3Button />
      </PstlW3Providers>
    )
  }),
  TransactionCard: <BaseModal />,
  ModalNoTheme: withThemeProvider(() => (
    <PstlW3Providers
      config={{
        appName: 'No theme',
        chains: [sepolia],
        modals: {
          root: {
            themeConfig: {
              theme: createTheme({
                DEFAULT: {
                  modals: {
                    base: {
                      title: {
                        font: {
                          color: 'pink'
                        }
                      }
                    },
                    connection: {
                      background: {
                        url: 'https://uploads-ssl.webflow.com/63fdf8c863bcf0c02efdffbc/64144c23e693f7d7f5cdb958_chorus_logo.svg'
                      }
                    }
                  }
                }
              })
            }
          },
          walletConnect: {
            projectId: 'a01e2f3b7c64ff495f9cb28e4e2d4b49'
          }
        }
      }}
    >
      <h1>Hello world!</h1>
      <Web3Button />
    </PstlW3Providers>
  ))
}

function BaseModal(): React.ReactElement<any, any> {
  const addPending = useUpdateTransactionsViaCallback()
  const callback = useCallback(
    () =>
      addPending(() => [
        {
          ...DEFAULT_TX,
          safeTxInfo: {
            confirmationsRequired: 5,
            confirmations: [
              {
                signature: truncateLongString(
                  '0xf5b96bc93db9edf9bd9e87b110267aa9464a2a6cb33ca5f1b09198a286837c83683b879db166519dc0f8546ea7579edad2b813258e2a93656f2c24f90bc824641c'
                ),
                owner: '0x4cdbf9243393342A988D2C41Fe8bF7DcdFe82A3b',
                submissionDate: new Date().toISOString()
              }
            ]
          },
          chainId: 11155111,
          dateAdded: Date.now() - 1_000_000,
          walletType: 'SAFE',
          safeTxHash: '0x123',
          transactionHash: undefined,
          nonce: 100,
          status: 'pending'
        }
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const modal = useMemo(
    (): React.ReactElement<any, any> =>
      withThemeProvider(() => (
        <PstlW3Providers config={DEFAULT_PROPS_WEB3AUTH}>
          <ModalOpenButton view="Transactions" callback={callback} />
        </PstlW3Providers>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return <>{modal}</>
}

function ModalOpenButton({ view = 'HidDeviceOptions', callback }: { view?: RouterView; callback?: () => void }) {
  const { open } = usePstlWeb3Modal()
  const { address, connector } = useUserConnectionInfo()

  return (
    <ColumnCenter>
      <PstlButton
        buttonVariant={ButtonVariations.PRIMARY}
        onClick={() => {
          open()
          callback?.()
          RouterCtrl.push(view)
        }}
      >
        Open HID Device modal
      </PstlButton>
      <h3>Connected to {address || 'DISCONNECTED!'}</h3>
      <h3>Connector: {connector?.id}</h3>
    </ColumnCenter>
  )
}
