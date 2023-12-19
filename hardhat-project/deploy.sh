#!/bin/bash

rm -r "./artifacts"

rm -r "./cache"

yarn hardhat compile || { exit 1; }
[ $? -eq 0 ] && echo "success: compiled contracts"

yarn hardhat run --network sepolia scripts/deployPriceConsumer.ts || { exit 1; }
[ $? -eq 0 ] && echo "success: deployed and verified PriceConsumer contract on Sepolia"

yarn hardhat run --network polygonMumbai scripts/deployPriceConsumer.ts || { exit 1; }
[ $? -eq 0 ] && echo "success: deployed and verified PriceConsumer contract on polygonMumbai"

yarn hardhat run --network polygonMumbai scripts/deployVerifier.ts || { exit 1; }
[ $? -eq 0 ] && echo "success: deployed and verified Verfier contract on polygonMumbai"

yarn hardhat run --network polygonMumbai scripts/deployZKShield.ts || { exit 1; }
[ $? -eq 0 ] && echo "success: deployed and verified ZKShield contract on polygonMumbai"

node ./scripts/setFeedsPolygonMumbai.mjs || { exit 1; }
[ $? -eq 0 ] && echo "success: set feeds on polygonMumbai"

node ./scripts/setFeedsSepolia.mjs || { exit 1; }
[ $? -eq 0 ] && echo "success: set feeds on Sepolia"

mkdir "../webapp/utils/contracts"

cp ./data/priceConsumerSepolia.json ../webapp/utils/contracts/priceConsumerSepolia.json || { exit 1; }
[ $? -eq 0 ] && echo "success: copied priceConsumerSepolia.json to the backend"

cp ./data/priceConsumerPolygonMumbai.json ../webapp/utils/contracts/priceConsumerPolygonMumbai.json || { exit 1; }
[ $? -eq 0 ] && echo "success: copied priceConsumerPolygonMumbai.json to the backend"

cp ./data/zKShieldPolygonMumbai.json ../webapp/utils/contracts/zKShieldPolygonMumbai.json || { exit 1; }
[ $? -eq 0 ] && echo "success: copied zKShieldPolygonMumbai.json to the backend"

mkdir "../webapp/frontend/src/contracts"

cp ./data/zKShieldPolygonMumbai.json ../webapp/frontend/src/contracts/zKShieldPolygonMumbai.json || { exit 1; }
[ $? -eq 0 ] && echo "success: copied zKShieldPolygonMumbai.json to the frontend"

cp ./data/verifierPolygonMumbai.json ../webapp/frontend/src/contracts/verifierPolygonMumbai.json || { exit 1; }
[ $? -eq 0 ] && echo "success: copied verifierPolygonMumbai.json to the frontend"
