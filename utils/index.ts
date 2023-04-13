// export * from "./abi"
export * from "./address"
export * from "./domain"
export * from "./gas"

import * as HypERC20Artifacts from "./abi/HypERC20.json"
import * as HypERC20CollateralArtifacts from "./abi/HypERC20Collateral.json"
import * as MockReceiverArtifacts from "./abi/MockERC777Receiver.json"
import * as wethAbi from "./abi/weth.json"
import * as ERC1820Abi from "./abi/ERC1820.json"

export const abi = {
    hypERC20: HypERC20Artifacts.abi,
    hypERC20Collateral: HypERC20CollateralArtifacts.abi,
    mockReceiver: MockReceiverArtifacts.abi,
    weth: wethAbi.abi,
    erc1820: ERC1820Abi.abi
}
