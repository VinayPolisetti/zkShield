import hre, { ethers } from "hardhat"
import { writeFileSync, existsSync, mkdirSync } from "fs"

async function main() {
    const ZKShield = await ethers.getContractFactory("ZKShield")
    const zKShield = await ZKShield.deploy()
    await zKShield.deployTransaction.wait(5)
    await hre.run("verify:verify", {
        address: zKShield.address,
    })
    const zKShieldData = JSON.stringify({
        address: zKShield.address,
        abi: JSON.parse(zKShield.interface.format("json") as string),
    })
    const directory = "./data/"
    const fileName =
        "zKShield" +
        hre.hardhatArguments.network?.charAt(0).toUpperCase() +
        hre.hardhatArguments.network?.slice(1) +
        ".json"

    if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true })
    }
    writeFileSync(directory + fileName, zKShieldData)
}

main()
    .then(() => (process.exitCode = 0))
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
