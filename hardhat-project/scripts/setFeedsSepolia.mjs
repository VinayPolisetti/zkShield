import { ethers } from "ethers"
import priceConsumerSepolia from "../data/priceConsumerSepolia.json" assert { type: "json" }
import dotenv from "dotenv"
dotenv.config()

const main = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.ALCHEMY_SEPOLIA || ""
    )
    const wallet = new ethers.Wallet(
        process.env.WALLET_PRIVATE_KEY || "",
        provider
    )
    const PriceConsumer = new ethers.Contract(
        priceConsumerSepolia.address,
        priceConsumerSepolia.abi,
        wallet
    )
    // All the feeds below are from chainlink (https://docs.chain.link/data-feeds/price-feeds/addresses/?network=polygon), the addresses to the feed could be changed in the future
    // System contract has been used as token for native coin
    console.log("Setting up price feed for ETH token:") // Not sure about how the first address is written which is for the token
    console.log(
        await PriceConsumer.setFeeds(
            ["0x0000000000000000000000000000000000000000"],
            ["0x694AA1769357215DE4FAC081bf1f309aDC325306"]
        )
    )
    console.log("Setting up price feed for USDC token:")
    console.log(
        await PriceConsumer.setFeeds(
            ["0x746d7b1dfcD1Cc2f4b7d09F3F1B9A21764FBeB33"],
            ["0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"]
        )
    )
}

main()
    .then(() => (process.exitCode = 0))
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
