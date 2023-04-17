# HyperBOB

[This is the project built at the ETHGlobal Tokyo](https://ethglobal.com/showcase/hyperbob-fz6rz)  

<img src="src/assets/img/icon-128.png" width="64"/>

https://user-images.githubusercontent.com/4685781/232259959-147e40e0-1e03-4e59-9c3a-40d94d86de78.mp4

## Project Description

HyperBOB is an [ERC4337](https://eips.ethereum.org/EIPS/eip-4337) wallet that implements an anonymous transfer feature on Ethereum L1, where wallet users are able to transfer any stablecoin to another address without exposing the on-chain connection of each address. This is made possible by the combination of cutting-edge technologies, such as [HyperLane](https://www.hyperlane.xyz/)’s customizable interchain bridge and [zkBOB](https://dapp.expert/dapp/)’s zero-knowledge solution for private token transfer.

## How it's Made

The zk solution utilized for this private transfer feature is built by zkBOB which is currently only available on Optimism and Polygon but not on Ethereum L1 as its on-chain zk-proof verification is undeniably gas-expensive. However, HyperBOB allows users to have access to zkBOB from L1 by integrating Hyperlane’s Warp API that helps bridge BOB from L1 to Polygon.

\*The current zkBOB’s fee model doesn’t have users pay gas fees on-chain but charges small fees in BOB subtracted from the deposit balance, which means that they subsidize the cost of on-chain transactions.

Hypelane Warp API consists of two router contracts separately deployed on both local and remote chain. Our HypERC20Collateral on L1 contract serves as a pool for depositing BOB and HyperLane’s relayer sends a request to HypERC20 that mints a wrapped BOB token to the AA wallet on L2.

HypERC20 itself is a token contract that is also compliant with the ERC777 standard and HyperBOB AA wallet implements ERC777receiver interface. Hence, when AA wallet contract receives the newly minted BOB, tokensReceived method on the AA contract gets triggered in which subsequent functions to deposit BOB to zkBOB contract will be executed.

The function used for depositing BOB to zkBOBPool is directDeposit which allows any external contract to directly deposit BOB to a zkBOB Account with a given zkAddress. So, the sender, HyperBOB AA wallet, doesn’t have to interact with zkBOB app UI beforehand, in which usually they would have to create zkAccount first and deposit BOB to the zkBOBPool.

And most importantly, all of the complex executions described above is done by sending one transaction while it actually contains multiple transactions in a cross-chain manner, such as approve, swap, bridge, and deposit. So from the user’s point of view, it’s just one click. This is enabled because of the mere fact that the Account Abstraction wallet can execute a batch call and implement arbitrary executions inside.

## Installation and Running

1. Verify that your [Node.js](https://nodejs.org/) version is >= **18.12.0**.
2. Clone this repository.
3. Make sure you configure the `provider` in `src/exconfig.json` to the `Goerli` network.
4. Edit the `bundler` URL pointing to `Goerli` network and accepting EntryPoint=`0x0576a174D229E3cFA37253523E645A78A0C91B57`
5. Run `yarn install` to install the dependencies.
6. Run `yarn start`
7. Load your extension in Chrome by following these steps:
   1. Go to `chrome://extensions/`
   2. Enable `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.

[zkBOB on Sepolia testnet](https://staging--zkbob.netlify.app/deposit)
