import SafeApiKit from '@safe-global/api-kit'

import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { SafeFactory } from '@safe-global/protocol-kit'
import { SafeAccountConfig } from '@safe-global/protocol-kit'

// https://chainlist.org/?search=goerli&testnets=true
const RPC_URL = 'https://eth-goerli.public.blastapi.io'

export async function test(providerr: any, signerd: any) {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    const signer = new ethers.Wallet("92731ae580575e44f5e6532a8b926f081181b1fa4c8976748988ffa5de7f2570",provider)
    const ethAdapterOwner1 = new EthersAdapter({
        ethers,
        signerOrProvider: signer
    })
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
    const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapterOwner1 })
    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapterOwner1 })
    const safeAccountConfig: SafeAccountConfig = {
        owners: [signer.address],
        threshold: 1,
    }
    /* This Safe is tied to owner 1 because the factory was initialized with
an adapter that had owner 1 as the signer. */
    const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig })

    const safeAddress = safeSdkOwner1.getAddress()

    console.log('Your Safe has been deployed:')
    console.log(`https://goerli.etherscan.io/address/${safeAddress}`)
    console.log(`https://app.safe.global/gor:${safeAddress}`)
}