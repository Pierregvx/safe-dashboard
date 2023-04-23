/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { EthHashInfo } from '@safe-global/safe-react-components'

import {
  ADAPTER_EVENTS,
  WALLET_ADAPTERS
} from '@web3auth/base'
// import RPC from ".api/ethersRPC"; // for using ethers.js
// Plugins
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
// Adapters
import { useEffect, useState } from "react";
import {
  SafeAuthKit,
  SafeAuthSignInData,
  Web3AuthAdapter,
  Web3AuthEventListener
} from "@safe-global/auth-kit";
const connectedHandler: Web3AuthEventListener = (data) => console.log('CONNECTED', data)
const disconnectedHandler: Web3AuthEventListener = (data) => console.log('DISCONNECTED', data)

const clientId = "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk"; // get from https://dashboard.web3auth.io
import AppBar from "./AppBar"
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { test } from "./AA_create";
function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [torusPlugin, setTorusPlugin] = useState<TorusWalletConnectorPlugin | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData | null>(
    null
  )
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthAdapter>>()

  useEffect(() => {
    ; (async () => {
      const options: Web3AuthOptions = {
        clientId: clientId,
        web3AuthNetwork: 'testnet',
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x5',
          rpcTarget: `https://goerli.infura.io/v3/f1bed5a8674b48cdad93d8f6c69e7201`
        },
        uiConfig: {
          theme: 'dark',
          loginMethodsOrder: ['google', 'facebook']
        }
      }

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: 'torus',
          showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: 'metamask',
          showOnDesktop: true,
          showOnMobile: false
        }
      }

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'mandatory'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      const adapter = new Web3AuthAdapter(options, [openloginAdapter], modalConfig)

      const safeAuthKit = await SafeAuthKit.init(adapter, {
        txServiceUrl: 'https://safe-transaction-goerli.safe.global'
      })

      safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)

      safeAuthKit.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)

      setSafeAuth(safeAuthKit)

      return () => {
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)
      }
    })()
  }, [])
  const login = async () => {
    if (!safeAuth) return

    const response = await safeAuth.signIn()
    console.log('SIGN IN RESPONSE: ', response)

    setSafeAuthSignInResponse(response)
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider)
  }

  const logout = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(null)
    setSafeAuthSignInResponse(null)
  }


  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <>
      <AppBar onLogin={login} onLogout={logout} isLoggedIn={!!provider} />
      {safeAuthSignInResponse?.eoa && (
        <>
          <Button onClick={() => test(provider, safeAuthSignInResponse.eoa)}>deploy a safe</Button>
          <Grid container>
            
            <Grid item md={4} p={4}>
           
              <Typography variant="h3" color="secondary" fontWeight={700}>
                Owner account
              </Typography>
              <Divider sx={{ my: 3 }} />
              <EthHashInfo
                address={safeAuthSignInResponse.eoa}
                showCopyButton
                showPrefix
                prefix={getPrefix('0x5')}
              />
            </Grid>
            <Grid item md={8} p={4}>
              <>
                <Typography variant="h3" color="secondary" fontWeight={700}>
                  Available Safes
                </Typography>
                <Divider sx={{ my: 3 }} />
                {safeAuthSignInResponse?.safes?.length ? (
                  safeAuthSignInResponse?.safes?.map((safe, index) => (
                    <Box sx={{ my: 3 }} key={index}>
                      <EthHashInfo address={safe} showCopyButton shortAddress={false} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="secondary" fontWeight={700}>
                    No Available Safes
                  </Typography>
                )}
              </>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

const getPrefix = (chainId: string) => {
  switch (chainId) {
    case '0x1':
      return 'eth'
    case '0x5':
      return 'gor'
    case '0x100':
      return 'gno'
    case '0x137':
      return 'matic'
    default:
      return 'eth'
  }
}

export default App