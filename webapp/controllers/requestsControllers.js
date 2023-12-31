import expressAsyncHandler from "express-async-handler"
import {
    getIncomingRequests,
    getOutgoingRequests,
    getRequestMetadatas,
    getRequestMetadata,
    setRequestMetadata,
    isUniqueUsername,
    getLatestId,
    getPublicKey,
    setRequests,
} from "../utils/zkshield.js"
import { encrypt, decrypt } from "../utils/cryptography.js"
import { netWorthCalculator } from "../utils/netWorthCalculator.js"
import { generateProof, generateCallData } from "../utils/zkp.js"
import { upload } from "../utils/ipfs.js"
import { ethers } from "ethers"

const getIncomingRequestsController = expressAsyncHandler(
    async (req, res, next) => {
        const fetchIncomingRequests = await getIncomingRequests(
            req.user.username.username
        )
        if (fetchIncomingRequests.success) {
            let incomingRequestsIds = fetchIncomingRequests.result
            let incomingRequestsIdsTemp = []
            incomingRequestsIds.forEach((id) => {
                incomingRequestsIdsTemp.push(
                    decrypt(req.user.username.privateKey, id)
                )
            })
            incomingRequestsIds = incomingRequestsIdsTemp
            const fetchedIncomingRequestsMetadata = await getRequestMetadatas(
                incomingRequestsIds
            )
            if (fetchedIncomingRequestsMetadata.success) {
                let incomingRequests = [[], []]
                fetchedIncomingRequestsMetadata.result.forEach(
                    (metadata, index) => {
                        if (metadata.status == 0) {
                            incomingRequests[0].push({
                                id: incomingRequestsIds[index],
                                username: decrypt(
                                    req.user.username.privateKey,
                                    metadata.sender
                                ),
                                threshold: ethers.utils.formatUnits(
                                    metadata.threshold,
                                    0
                                ),
                                isLoading: false,
                            })
                        } else {
                            incomingRequests[1].push({
                                id: incomingRequestsIds[index],
                                username: decrypt(
                                    req.user.username.privateKey,
                                    metadata.sender
                                ),
                                threshold: ethers.utils.formatUnits(
                                    metadata.threshold,
                                    0
                                ),
                                action:
                                    metadata.status == 1
                                        ? "Accepted"
                                        : "Rejected",
                                response:
                                    metadata.status == 1
                                        ? metadata.result
                                            ? "Net worth is equal to or above threshold amount"
                                            : "Net worth is below threshold amount"
                                        : "-",
                            })
                        }
                    }
                )
                incomingRequests[0].reverse()
                incomingRequests[1].reverse()
                return res.status(200).json({
                    message: "Incoming requests fetched successfully!",
                    data: incomingRequests,
                })
            } else {
                return res.status(200).json({
                    error: "Fetching incoming requests from blockchain failed",
                    message: "Please try again",
                })
            }
        } else {
            return res.status(200).json({
                error: "Fetching incoming requests from blockchain failed",
                message: "Please try again",
            })
        }
    }
)

const updateRequestController = expressAsyncHandler(async (req, res, next) => {
    const { id, sender, status } = req.body
    if (id == undefined) {
        return res.status(200).json({
            error: "Data missing",
            message: "Id is not provided",
        })
    }
    if (sender == undefined) {
        return res.status(200).json({
            error: "Data missing",
            message: "Sender is not provided",
        })
    }
    if (status == undefined) {
        return res.status(200).json({
            error: "Data missing",
            message: "Satus is not provided",
        })
    }
    if (!(status == 1 || status == -1)) {
        return res.status(200).json({
            error: "Incorrect data",
            message: "Satus value is incorrect",
        })
    }
    const fetchedRequestMetadata = await getRequestMetadata(id)
    if (fetchedRequestMetadata.success) {
        const requestMetadata = fetchedRequestMetadata.result
        if (
            decrypt(req.user.username.privateKey, requestMetadata.sender) ==
            sender
        ) {
            if (status == 1) {
                const netWorthCalculatorReturn = await netWorthCalculator(
                    req.user.username.username,
                    req.user.username.privateKey
                )
                if (netWorthCalculatorReturn.success) {
                    const netWorth = netWorthCalculatorReturn.result
                    const threshold = Number(
                        ethers.utils.formatUnits(requestMetadata.threshold, 0)
                    )
                    const callData = await generateCallData(
                        await generateProof({ netWorth, threshold })
                    )
                    const uploadingFileResult = await upload(
                        `proof.txt`,
                        callData
                    )
                    if (uploadingFileResult.success) {
                        const setRequestMetadataResponse =
                            await setRequestMetadata(
                                id,
                                requestMetadata.sender,
                                requestMetadata.receiver,
                                requestMetadata.threshold,
                                1,
                                netWorth < threshold ? 0 : 1,
                                uploadingFileResult.cid
                            )
                        if (setRequestMetadataResponse.success) {
                            return res.status(200).json({
                                message: "Request accepted successfully!",
                                data: netWorth < threshold ? 0 : 1,
                            })
                        } else {
                            return res.status(200).json({
                                error: "Updating request on blockchain failed",
                                message: "Please try again",
                            })
                        }
                    } else {
                        return res.status(200).json({
                            error: "Updating request on blockchain failed",
                            message: "Please try again",
                        })
                    }
                } else {
                    return res.status(200).json({
                        error: "Updating request on blockchain failed",
                        message: "Please try again",
                    })
                }
            } else {
                const setRequestMetadataResponse = await setRequestMetadata(
                    id,
                    requestMetadata.sender,
                    requestMetadata.receiver,
                    requestMetadata.threshold,
                    -1,
                    requestMetadata.result,
                    requestMetadata.proof
                )
                if (setRequestMetadataResponse.success) {
                    return res.status(200).json({
                        message: "Request rejected successfully!",
                    })
                } else {
                    return res.status(200).json({
                        error: "Updating request on blockchain failed",
                        message: "Please try again",
                    })
                }
            }
        } else {
            return res.status(200).json({
                error: "Incorrect data",
                message: "Id provided is incorrect",
            })
        }
    } else {
        if (fetchedRequestMetadata.error.reason == "Invalid id provided") {
            return res.status(200).json({
                error: "Incorrect data",
                message: "Id provided is incorrect",
            })
        } else {
            return res.status(200).json({
                error: "Updating request on blockchain failed",
                message: "Please try again",
            })
        }
    }
})

const getOutgoingRequestsFunc = async (username, privateKey) => {
    const fetchOutgoingRequests = await getOutgoingRequests(username)
    if (fetchOutgoingRequests.success) {
        let outgoingRequestsIds = fetchOutgoingRequests.result
        let outgoingRequestsIdsTemp = []
        outgoingRequestsIds.forEach((id) => {
            outgoingRequestsIdsTemp.push(decrypt(privateKey, id))
        })
        outgoingRequestsIds = outgoingRequestsIdsTemp
        const fetchedOutgoingRequestsMetadata = await getRequestMetadatas(
            outgoingRequestsIds
        )
        if (fetchedOutgoingRequestsMetadata.success) {
            let outgoingRequests = []
            fetchedOutgoingRequestsMetadata.result.forEach((metadata) => {
                if (metadata.status == 0 || metadata.status == -1) {
                    outgoingRequests.push({
                        username: decrypt(privateKey, metadata.receiver),
                        threshold: ethers.utils.formatUnits(
                            metadata.threshold,
                            0
                        ),
                        status: metadata.status == 0 ? "Pending" : "Rejected",
                        result: "-",
                        cid: "",
                        isLoading: false,
                    })
                } else {
                    outgoingRequests.push({
                        username: decrypt(privateKey, metadata.receiver),
                        threshold: ethers.utils.formatUnits(
                            metadata.threshold,
                            0
                        ),
                        status: "Accepted",
                        result: metadata.result
                            ? "Net worth is equal to or above threshold amount"
                            : "Net worth is below threshold amount",
                        cid: metadata.proof,
                        isLoading: false,
                    })
                }
            })
            outgoingRequests.reverse()
            return {
                message: "Outgoing requests fetched successfully!",
                data: outgoingRequests,
            }
        } else {
            return {
                error: "Fetching outgoing requests from blockchain failed",
                message: "Please try again",
            }
        }
    } else {
        return {
            error: "Fetching outgoing requests from blockchain failed",
            message: "Please try again",
        }
    }
}

const getOutgoingRequestsController = expressAsyncHandler(
    async (req, res, next) => {
        const result = await getOutgoingRequestsFunc(
            req.user.username.username,
            req.user.username.privateKey
        )
        return res.status(200).json(result)
    }
)

const setRequestController = expressAsyncHandler(async (req, res, next) => {
    let { receiver, threshold } = req.body
    if (receiver == undefined) {
        return res.status(200).json({
            error: "Data missing",
            message: "Request receiver's username is not provided",
        })
    }
    const uniqueUsernameCheck = await isUniqueUsername(receiver)
    if (!uniqueUsernameCheck.success) {
        return res.status(200).json({
            error: "Username check failed",
            message: "Please try again",
        })
    }
    if (uniqueUsernameCheck.result) {
        return res.status(200).json({
            error: "Username does not exist",
            message: "Please enter correct username",
        })
    }
    const outgoingRequests = await getOutgoingRequestsFunc(
        req.user.username.username,
        req.user.username.privateKey
    )
    if (!("error" in outgoingRequests)) {
        for (let i = 0; i < outgoingRequests.data.length; i++) {
            if (
                outgoingRequests.data[i].username == receiver &&
                outgoingRequests.data[i].status == "Pending"
            ) {
                return res.status(200).json({
                    error: "Request couldn't be sent",
                    message:
                        "A request with a pending response has already been sent to the user!",
                })
            }
        }
    } else {
        return res.status(200).json({
            error: "Request couldn't be sent",
            message: "Please try again",
        })
    }
    if (threshold == undefined) {
        return res.status(200).json({
            error: "Data missing",
            message: "Threshold amount is not provided",
        })
    }
    if (isNaN(Number(threshold)) || !Number.isInteger(Number(threshold))) {
        return res.status(200).json({
            error: "Invalid threshold amount",
            message: "Threshold amount is not an integer",
        })
    }
    threshold = Number(threshold)
    if (threshold < 0) {
        return res.status(200).json({
            error: "Invalid threshold amount",
            message: "Threshold amount cannot be negative",
        })
    }
    const senderPublicKeyResult = await getPublicKey(req.user.username.username)
    if (!senderPublicKeyResult.success) {
        return res.status(200).json({
            error: "Request couldn't be sent",
            message: "Please try again",
        })
    }
    const receiverPublicKeyResult = await getPublicKey(receiver)
    if (!receiverPublicKeyResult.success) {
        return res.status(200).json({
            error: "Request couldn't be sent",
            message: "Please try again",
        })
    }
    const setRequestMetadataResult = await setRequestMetadata(
        0,
        encrypt(receiverPublicKeyResult.result, req.user.username.username),
        encrypt(senderPublicKeyResult.result, receiver),
        threshold,
        0,
        0,
        "-"
    )
    if (setRequestMetadataResult.success) {
        const idResult = await getLatestId()
        if (idResult.success) {
            const setRequestResult = await setRequests(
                req.user.username.username,
                encrypt(
                    senderPublicKeyResult.result,
                    idResult.result.toString()
                ),
                receiver,
                encrypt(
                    receiverPublicKeyResult.result,
                    idResult.result.toString()
                )
            )
            if (setRequestResult.success) {
                return res
                    .status(200)
                    .json({ message: "Request sent successfully!" })
            } else {
                return res.status(200).json({
                    error: "Request couldn't be sent",
                    message: "Please try again",
                })
            }
        } else {
            return res.status(200).json({
                error: "Request couldn't be sent",
                message: "Please try again",
            })
        }
    } else {
        return res.status(200).json({
            error: "Request couldn't be sent",
            message: "Please try again",
        })
    }
})

export {
    getIncomingRequestsController,
    updateRequestController,
    getOutgoingRequestsController,
    setRequestController,
}
