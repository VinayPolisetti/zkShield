import { ethers } from "ethers"
import { getPrices, getNativeBalance, getBalances } from "./priceConsumer.js"
import {
    getPrimaryWalletAddress,
    getSecondaryWalletAddresses,
} from "./zkshield.js"
import { decrypt } from "./cryptography.js"

// These constants can be updated when support for more networks or coins is added
const pricesRef = [
    {
        network: "polygonMumbai",
        tokens: [
            "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
            "0x0000000000000000000000000000000000000000",
            "0xaDb88FCc910aBfb2c03B49EE2087e7D6C2Ddb2E9",
            "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
        ],
        cryptoName: ["ETH", "MATIC", "BTC", "USDC"],
        decimalPlaces: [8, 8, 8, 8],
    },
]

const balancesRef = [
    {
        network: "sepolia",
        tokens: [
            "",
            "0x746d7b1dfcD1Cc2f4b7d09F3F1B9A21764FBeB33",
        ],
        cryptoName: ["ETH", "USDC"],
        decimalPlaces: [18, 6],
    },
    {
        network: "polygonMumbai",
        tokens: [
            "",
            "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
            "0xaDb88FCc910aBfb2c03B49EE2087e7D6C2Ddb2E9",
            "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
        ],
        cryptoName: ["MATIC", "ETH", "BTC", "USDC"],
        decimalPlaces: [18, 18, 8, 6],
    },
]

const netWorthCalculator = async (username, privateKey) => {
    let prices = {}
    for (let i = 0; i < pricesRef.length; i++) {
        const fetchedPrices = await getPrices(
            pricesRef[i].tokens,
            pricesRef[i].network
        )
        if (fetchedPrices.success) {
            for (let j = 0; j < pricesRef[i].tokens.length; j++) {
                prices[pricesRef[i].cryptoName[j]] = Number(
                    ethers.utils.formatUnits(
                        fetchedPrices.result[j],
                        pricesRef[i].decimalPlaces[j]
                    )
                )
            }
        } else {
            return { success: false, error: fetchedPrices.error }
        }
    }

    let wallets = []
    const getPrimaryWalletAddressResult = await getPrimaryWalletAddress(
        username
    )
    if (getPrimaryWalletAddressResult.success) {
        wallets.push(decrypt(privateKey, getPrimaryWalletAddressResult.result))
    } else {
        return { success: false, error: getPrimaryWalletAddressResult.error }
    }
    const getSecondaryWalletAddressesResult = await getSecondaryWalletAddresses(
        username
    )
    if (getSecondaryWalletAddressesResult.success) {
        for (
            let i = 0;
            i < getSecondaryWalletAddressesResult.result.length;
            i++
        ) {
            wallets.push(
                decrypt(privateKey, getSecondaryWalletAddressesResult.result[i])
            )
        }
    } else {
        return {
            success: false,
            error: getSecondaryWalletAddressesResult.error,
        }
    }

    let balances = {}
    for (let i = 0; i < wallets.length; i++) {
        for (let j = 0; j < balancesRef.length; j++) {
            const getNativeBalanceResult = await getNativeBalance(
                wallets[i],
                balancesRef[j].network
            )
            if (getNativeBalanceResult.success) {
                if (balancesRef[j].cryptoName[0] in balances) {
                    balances[balancesRef[j].cryptoName[0]] += Number(
                        ethers.utils.formatUnits(
                            getNativeBalanceResult.result,
                            balancesRef[j].decimalPlaces[0]
                        )
                    )
                } else {
                    balances[balancesRef[j].cryptoName[0]] = Number(
                        ethers.utils.formatUnits(
                            getNativeBalanceResult.result,
                            balancesRef[j].decimalPlaces[0]
                        )
                    )
                }
                const getBalancesResult = await getBalances(
                    wallets[i],
                    balancesRef[j].tokens.slice(1),
                    balancesRef[j].network
                )
                if (getBalancesResult.success) {
                    for (let k = 1; k < balancesRef[j].tokens.length; k++) {
                        if (balancesRef[j].cryptoName[k] in balances) {
                            balances[balancesRef[j].cryptoName[k]] += Number(
                                ethers.utils.formatUnits(
                                    getBalancesResult.result[k - 1],
                                    balancesRef[j].decimalPlaces[k]
                                )
                            )
                        } else {
                            balances[balancesRef[j].cryptoName[k]] = Number(
                                ethers.utils.formatUnits(
                                    getBalancesResult.result[k - 1],
                                    balancesRef[j].decimalPlaces[k]
                                )
                            )
                        }
                    }
                } else {
                    return {
                        success: false,
                        error: getBalancesResult.error,
                    }
                }
            } else {
                return {
                    success: false,
                    error: getNativeBalanceResult.error,
                }
            }
        }
    }

    let netWorth = 0

    for (const coin in balances) {
        netWorth += prices[coin] * balances[coin]
    }

    return { success: true, result: Math.floor(netWorth) }
}

export { netWorthCalculator }
