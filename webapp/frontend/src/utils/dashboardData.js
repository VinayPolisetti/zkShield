export const priceTokens = {
    network: "polygonMumbai",
    names: ["ETH", "MATIC", "BTC", "USDC"],
    tokens: [
        "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
        "0x0000000000000000000000000000000000000000",
        "0xaDb88FCc910aBfb2c03B49EE2087e7D6C2Ddb2E9",
        "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
    ],
    decimalPlaces: [8, 8, 8, 8], // To adjust the number of decimal places after price returned for the respective tokens
}

// Probably sepolia dont have a wrapped matic token in it. Check at https://docs.chain.link/data-feeds/price-feeds/addresses/?network=ethereum&page=1.
// But, even though goerli has it written, ig its stopped now since the contract is not transacting
// These are not chainlink addresses, these are token addresses. Check carefully. 
// We need to set feeds using .mjs file for PriceConsumerGoerli as well
export const quantityTokens = [
    {
        network: "polygonMumbai",
        networkDisplayName: "Polygon Mumbai",
        names: ["MATIC", "ETH", "BTC", "USDC"],
        tokens: [
            "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
            "0xaDb88FCc910aBfb2c03B49EE2087e7D6C2Ddb2E9",
            "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
        ],
        decimalPlaces: [18, 18, 8, 6],
    },
    {
        network: "sepolia",
        networkDisplayName: "Sepolia",
        names: ["ETH", "USDC"],
        tokens: [//There's no wrapped bitcoin and matic on sepolia. So, we have removed it.
            "0x746d7b1dfcD1Cc2f4b7d09F3F1B9A21764FBeB33",
        ],
        decimalPlaces: [18, 6],
    },
]

export const colors = [
    "rgba(0,250,154,0.2)",
    "rgba(255, 99, 132, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(153, 102, 255, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(255, 159, 64, 0.2)",
    "rgba(128,0,0,0.2)",
    "rgba(255,215,0,0.2)",
    "rgba(255,69,0,0.2)",
    "rgba(0,128,0,0.2)",
    "rgba(220,20,60,0.2)",
    "rgba(127,255,212,0.2)",
    "rgba(0,191,255,0.2)",
    "rgba(0,255,255,0.2)",
    "rgba(188,143,143,0.2)",
    "rgba(154,205,50,0.2)",
    "rgba(135,206,250,0.2)",
    "rgba(123,104,238,0.2)",
    "rgba(255,250,205,0.2)",
    "rgba(210,105,30,0.2)",
    "rgba(255,20,147,0.2)",
    "rgba(128,0,128,0.2)",
    "rgba(112,128,144,0.2)",
    "rgba(0,0,255,0.2)",
    "rgba(128,128,0,0.2)",
]

export const borderColors = [
    "rgba(0,250,154,1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(128,0,0,1)",
    "rgba(255,215,0,1)",
    "rgba(255,69,0,1)",
    "rgba(0,128,0,1)",
    "rgba(220,20,60,1)",
    "rgba(127,255,212,1)",
    "rgba(0,191,255,1)",
    "rgba(0,255,255,1)",
    "rgba(188,143,143,1)",
    "rgba(154,205,50,1)",
    "rgba(135,206,250,1)",
    "rgba(123,104,238,1)",
    "rgba(255,250,205,1)",
    "rgba(210,105,30,1)",
    "rgba(255,20,147,1)",
    "rgba(128,0,128,1)",
    "rgba(112,128,144,1)",
    "rgba(0,0,255,1)",
    "rgba(128,128,0,1)",
]
