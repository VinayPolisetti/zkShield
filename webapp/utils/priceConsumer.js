import { ethers } from "ethers"
import {
    ALCHEMY_SEPOLIA,
    ALCHEMY_POLYGONMUMBAI,
    WALLET_PRIVATE_KEY,
} from "../env.js"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const priceConsumerSepolia = require("./contracts/priceConsumerSepolia.json")
const priceConsumerPolygonMumbai = require("./contracts/priceConsumerPolygonMumbai.json")

const providerSepolia = new ethers.providers.JsonRpcProvider(ALCHEMY_SEPOLIA)
const providerSepoliaContract = new ethers.Contract(
    priceConsumerSepolia.address,
    priceConsumerSepolia.abi,
    providerSepolia
)
const walletSepolia = new ethers.Wallet(WALLET_PRIVATE_KEY, providerSepolia)
const signerSepoliaContract = providerSepoliaContract.connect(walletSepolia)

const providerPolygonMumbai = new ethers.providers.JsonRpcProvider(
    ALCHEMY_POLYGONMUMBAI
)
const providerPolygonMumbaiContract = new ethers.Contract(
    priceConsumerPolygonMumbai.address,
    priceConsumerPolygonMumbai.abi,
    providerPolygonMumbai
)
const walletPolygonMumbai = new ethers.Wallet(
    WALLET_PRIVATE_KEY,
    providerPolygonMumbai
)
const signerPolygonMumbaiContract =
    providerPolygonMumbaiContract.connect(walletPolygonMumbai)

const networkMapper = {
    sepolia: [providerSepoliaContract, signerSepoliaContract],
    polygonMumbai: [providerPolygonMumbaiContract, signerPolygonMumbaiContract],
}

const isNetworkSupported = (network) => {
    if (!(network in networkMapper)) {
        return {
            success: false,
            error: "Provided network is not supported yet!",
        }
    }
    return { success: true }
}

const setFeeds = async (tokens, feeds, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][1]
        await contract.setFeeds(tokens, feeds)
        return { success: true }
    } catch (error) {
        return { success: false, error }
    }
}

const getPrice = async (token, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][0]
        const result = await contract.getPrice(token)
        return { success: true, result }
    } catch (error) {
        return { success: false, error }
    }
}

const getPrices = async (tokens, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][0]
        const result = await contract.getPrices(tokens)
        return { success: true, result }
    } catch (error) {
        return { success: false, error }
    }
}

const getNativeBalance = async (user, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][0]
        const result = await contract.getNativeBalance(user)
        return { success: true, result }
    } catch (error) {
        return { success: false, error }
    }
}

const getBalance = async (user, token, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][0]
        const result = await contract.getBalance(user, token)
        return { success: true, result }
    } catch (error) {
        return { success: false, error }
    }
}

const getBalances = async (user, tokens, network) => {
    try {
        const networkSupport = isNetworkSupported(network)
        if (!networkSupport.success) {
            return networkSupport
        }
        const contract = networkMapper[network][0]
        const result = await contract.getBalances(user, tokens)
        return { success: true, result }
    } catch (error) {
        return { success: false, error }
    }
}

export {
    setFeeds,
    getPrice,
    getPrices,
    getNativeBalance,
    getBalance,
    getBalances,
}
