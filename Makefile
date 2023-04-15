.PHONY: deploy

deploy:
	yarn hardhat run scripts/hypERC20Collateral.ts --network Goerli
	yarn hardhat run scripts/hypERC20.ts --network Sepolia
	yarn hardhat run scripts/accountFactory.ts --network Goerli
	yarn hardhat run scripts/accountFactory.ts --network Sepolia
	yarn hardhat run scripts/hypERC20InitEnroll.ts --network Sepolia
	yarn hardhat run scripts/hypERC20CollEnroll.ts --network Goerli