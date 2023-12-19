import { groth16 } from "snarkjs"

const generateProof = async (witness) => {
    const { proof, publicSignals } = await groth16.fullProve(
        witness,
        "./utils/zkp/threshold.wasm",
        "./utils/zkp/threshold_final.zkey"
    )
    return { proof, publicSignals } // PublicSignals have somehtung that verifier needs to know. Its public menaing it can be sahred with anyone
}

const generateCallData = async ({ proof, publicSignals }) => {
    const callData = await groth16.exportSolidityCallData(proof, publicSignals)
    return callData
}

export { generateProof, generateCallData }
