init:
	yarn && docker-compose up -d && yarn start

reset:
	docker-compose down && yarn && docker-compose up -d && yarn start

log:
	docker-compose logs -f

# yarn hardhat sendETH [walltAddress] [sendValue]