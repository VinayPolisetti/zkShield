import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import { useTheme } from "@mui/material/styles"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import Chip from "@mui/material/Chip"
import Tooltip from "@mui/material/Tooltip"
import Button from "@mui/material/Button"
import LoadingButton from "@mui/lab/LoadingButton"
import AddLinkIcon from "@mui/icons-material/AddLink"
import Skeleton from "@mui/material/Skeleton"
import Drawer from "../components/Drawer"
import Topbar from "../components/Topbar"
import { shortner } from "../utils/walletAddressShortner"
import { useCookies } from "react-cookie"
import axios from "axios"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import WalletRoundedIcon from "@mui/icons-material/WalletRounded"
import CreateIcon from "@mui/icons-material/Create"
import { useWeb3Modal } from "@web3modal/react"
import { useAccount, useSignMessage } from "wagmi"
import TextField from "@mui/material/TextField"
import Modal from "@mui/material/Modal"
import { Typography } from "@mui/material"
import { ethers } from "ethers"

const WalletsScreen = ({ drawerWidth }) => {
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [walletsData, setWalletsData] = useState(null)
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
    const [snackbarSeverity, setSnackbarSeverity] = useState("success")
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [cookies, removeCookie] = useCookies([])
    const { open } = useWeb3Modal()
    const { address } = useAccount()
    const { data, signMessage } = useSignMessage({
        message: "linking wallet",
    })
    const [submitLoading, setSubmitLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const columns = [
        { id: "walletAddress", label: "Wallet Address" },
        { id: "action", label: "", align: "right" },
    ]
    const [signedMessage, setSignedMessage] = useState(false)

    useEffect(() => {
        if (cookies.snackbar) {
            setSnackbarSeverity(cookies.snackbar.snackbarSeverity)
            setSnackbarMessage(cookies.snackbar.snackbarMessage)
            setIsSnackbarOpen(true)
            removeCookie("snackbar", { path: "/" })
        }
        axios({
            method: "get",
            url: "/api/wallets",
            headers: { Authorization: "Bearer " + cookies.token },
        })
            .then((resp) => {
                if (!("error" in resp.data)) {
                    setWalletsData(resp.data.data)
                    setSnackbarSeverity("success")
                    setSnackbarMessage(resp.data.message)
                } else {
                    setSnackbarSeverity("error")
                    setSnackbarMessage(
                        (resp.data.error ? resp.data.error : "") +
                            ": " +
                            (resp.data.message ? resp.data.message : "")
                    )
                }
                setIsSnackbarOpen(true)
            })
            .catch((error) => {
                setSnackbarSeverity("error")
                setSnackbarMessage(
                    "Oops something went wrong in fetching wallet details! Please reload"
                )
                setIsSnackbarOpen(true)
            })
    }, [])

    useEffect(() => {
        if (address == null || data == null) {
            setSignedMessage(false)
        } else {
            const signerAddress = ethers.utils.verifyMessage(
                "linking wallet",
                data
            )
            if (signerAddress == address) {
                setSignedMessage(true)
            } else {
                setSignedMessage(false)
            }
        }
    }, [data, address])

    const closeSnackBar = () => {
        setIsSnackbarOpen(false)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const signMessageFunc = () => {
        if (address == undefined) {
            setSnackbarSeverity("error")
            setSnackbarMessage("Wallet not connected!")
            setIsSnackbarOpen(true)
            setSubmitLoading(false)
            return
        }
        signMessage()
    }

    const linkSecondaryWallet = () => {
        setSubmitLoading(true)
        if (address == undefined) {
            setSnackbarSeverity("error")
            setSnackbarMessage("Wallet not connected!")
            setIsSnackbarOpen(true)
            setSubmitLoading(false)
            return
        }
        if (data == undefined || !signedMessage) {
            setSnackbarSeverity("error")
            setSnackbarMessage("Message not signed!")
            setIsSnackbarOpen(true)
            setSubmitLoading(false)
            return
        }
        axios({
            method: "post",
            url: "/api/wallets",
            headers: { Authorization: "Bearer " + cookies.token },
            data: {
                message: "linking wallet",
                signedMessage: data,
                secondaryWalletAddress: address,
            },
        })
            .then((resp) => {
                if (!("error" in resp.data)) {
                    setWalletsData((currentWalletsData) => {
                        let newWalletsData = []
                        currentWalletsData.forEach((walletData) => {
                            newWalletsData.push(walletData)
                        })
                        newWalletsData.push({
                            type: "secondary",
                            walletAddress: address,
                            isLoading: false,
                        })
                        return newWalletsData
                    })
                    setSnackbarSeverity("success")
                    setSnackbarMessage(resp.data.message)
                    setOpenModal(false)
                } else {
                    setSnackbarSeverity("error")
                    setSnackbarMessage(
                        (resp.data.error ? resp.data.error : "") +
                            ": " +
                            (resp.data.message ? resp.data.message : "")
                    )
                }
                setIsSnackbarOpen(true)
                setSubmitLoading(false)
            })
            .catch((error) => {
                setSnackbarSeverity("error")
                setSnackbarMessage(
                    "Oops something went wrong in linking wallet! Please try again"
                )
                setIsSnackbarOpen(true)
                setSubmitLoading(false)
            })
    }

    const unlinkSecondaryWalletAddress = (secondaryWalletAddress) => {
        setWalletsData((currentWalletsData) => {
            let newWalletsData = []
            for (let i = 0; i < currentWalletsData.length; i++) {
                if (
                    currentWalletsData[i].walletAddress !=
                    secondaryWalletAddress
                ) {
                    newWalletsData.push(currentWalletsData[i])
                } else {
                    newWalletsData.push({
                        type: "secondary",
                        walletAddress: secondaryWalletAddress,
                        isLoading: true,
                    })
                }
            }
            return newWalletsData
        })
        axios({
            method: "delete",
            url: "/api/wallets",
            headers: { Authorization: "Bearer " + cookies.token },
            data: {
                secondaryWalletAddress,
            },
        })
            .then((resp) => {
                if (!("error" in resp.data)) {
                    setWalletsData((currentWalletsData) => {
                        let newWalletsData = []
                        for (let i = 0; i < currentWalletsData.length; i++) {
                            if (
                                currentWalletsData[i].walletAddress !=
                                secondaryWalletAddress
                            ) {
                                newWalletsData.push(currentWalletsData[i])
                            }
                        }
                        return newWalletsData
                    })
                    setSnackbarSeverity("success")
                    setSnackbarMessage(resp.data.message)
                } else {
                    setWalletsData((currentWalletsData) => {
                        let newWalletsData = []
                        for (let i = 0; i < currentWalletsData.length; i++) {
                            if (
                                currentWalletsData[i].walletAddress !=
                                secondaryWalletAddress
                            ) {
                                newWalletsData.push(currentWalletsData[i])
                            } else {
                                newWalletsData.push({
                                    type: "secondary",
                                    walletAddress: secondaryWalletAddress,
                                    isLoading: false,
                                })
                            }
                        }
                        return newWalletsData
                    })
                    setSnackbarSeverity("error")
                    setSnackbarMessage(
                        (resp.data.error ? resp.data.error : "") +
                            ": " +
                            (resp.data.message ? resp.data.message : "")
                    )
                }
                setIsSnackbarOpen(true)
            })
            .catch((error) => {
                setWalletsData((currentWalletsData) => {
                    let newWalletsData = []
                    for (let i = 0; i < currentWalletsData.length; i++) {
                        if (
                            currentWalletsData[i].walletAddress !=
                            secondaryWalletAddress
                        ) {
                            newWalletsData.push(currentWalletsData[i])
                        } else {
                            newWalletsData.push({
                                type: "secondary",
                                walletAddress: secondaryWalletAddress,
                                isLoading: false,
                            })
                        }
                    }
                    return newWalletsData
                })
                setSnackbarSeverity("error")
                setSnackbarMessage(
                    "Oops something went wrong in unlinking wallet! Please try again"
                )
                setIsSnackbarOpen(true)
            })
    }

    return (
        <Box>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={isSnackbarOpen}
                onClose={closeSnackBar}
                autoHideDuration={6000}
            >
                <Alert
                    onClose={closeSnackBar}
                    severity={snackbarSeverity ? snackbarSeverity : ""}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage ? snackbarMessage : ""}
                </Alert>
            </Snackbar>

            {/* Top Bar */}
            <Topbar
                pageType="Wallets"
                drawerWidth={drawerWidth}
                handleDrawerToggle={handleDrawerToggle}
            />

            {/* Drawer */}
            <Drawer
                drawerWidth={drawerWidth}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                pageType="Wallets"
            />

            {/* Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pl: { xs: "20px", sm: `calc(${drawerWidth}px + 48px)` },
                    pt: { xs: "86px", sm: "118px" },
                    pr: { xs: "20px", sm: "48px" },
                    pb: { xs: "32px", sm: "48px" },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                        mb: "22px",
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddLinkIcon />}
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            cursor: "pointer",
                            alignItems: "center",
                        }}
                        onClick={() => setOpenModal(true)}
                    >
                        Link Wallet
                    </Button>
                </Box>
                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="Link Wallet"
                    aria-describedby="Linking Secondary Wallet"
                    sx={{ zIndex: 50 }}
                >
                    <Box
                        sx={{
                            width: "320px",
                            backgroundColor:
                                theme.palette.mode === "dark"
                                    ? "#1E1E1E"
                                    : "#F5F5F5",
                            borderRadius: 4,
                            padding: "20px",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            boxShadow: 24,
                        }}
                    >
                        <TextField
                            value={
                                address != undefined ? shortner(address) : ""
                            }
                            id="walletAddress"
                            label="Wallet Address"
                            sx={{ width: "100%", mb: "20px" }}
                            disabled
                        />
                        {submitLoading ? (
                            <LoadingButton
                                startIcon={<WalletRoundedIcon />}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    width: "280px",
                                    paddingY: "10px",
                                    mb: "20px",
                                }}
                                disabled
                            >
                                Connect Wallet
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                onClick={() => {
                                    open()
                                }}
                                loadingPosition="start"
                                startIcon={<WalletRoundedIcon />}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    width: "280px",
                                    paddingY: "10px",
                                    mb: "20px",
                                }}
                            >
                                Connect Wallet
                            </LoadingButton>
                        )}
                        <Typography
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                mb: "20px",
                            }}
                        >
                            Message Signed:
                            {signedMessage ? (
                                <Typography sx={{ color: "green", ml: "6px" }}>
                                    Yes
                                </Typography>
                            ) : (
                                <Typography sx={{ color: "red", ml: "6px" }}>
                                    No
                                </Typography>
                            )}
                        </Typography>
                        {submitLoading ? (
                            <LoadingButton
                                startIcon={<CreateIcon />}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    width: "280px",
                                    paddingY: "10px",
                                    mb: "20px",
                                }}
                                disabled
                            >
                                Sign Message
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                onClick={() => {
                                    signMessageFunc()
                                }}
                                loadingPosition="start"
                                startIcon={<CreateIcon />}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    width: "280px",
                                    paddingY: "10px",
                                    mb: "20px",
                                }}
                            >
                                Sign Message
                            </LoadingButton>
                        )}
                        <LoadingButton
                            onClick={() => linkSecondaryWallet()}
                            loading={submitLoading}
                            loadingPosition="start"
                            startIcon={<AddLinkIcon />}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                fontWeight: "bold",
                                width: "280px",
                                paddingY: "10px",
                                mt: "20px",
                            }}
                        >
                            Link Wallet
                        </LoadingButton>
                    </Box>
                </Modal>
                <Box
                    sx={{
                        width: "100%",
                        backgroundColor:
                            theme.palette.mode === "dark"
                                ? "#1E1E1E"
                                : "#F5F5F5",
                        borderRadius: 4,
                        p: "20px",
                        pb: "6px",
                    }}
                >
                    <TableContainer
                        sx={{
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    >
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column, index) => (
                                        <TableCell
                                            key={index}
                                            align={column.align}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            {walletsData == null ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Box>
                                                <Skeleton
                                                    variant="rounded"
                                                    width={200}
                                                    height={40}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right"></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <Box>
                                                <Skeleton
                                                    variant="rounded"
                                                    width={200}
                                                    height={40}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                sx={{
                                                    p: 0,
                                                    cursor: "default",
                                                    "&.MuiButtonBase-root:hover":
                                                        {
                                                            bgcolor:
                                                                "transparent",
                                                        },
                                                }}
                                            >
                                                <Skeleton
                                                    variant="rounded"
                                                    width={100}
                                                    height={40}
                                                />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            <Box>
                                                <Skeleton
                                                    variant="rounded"
                                                    width={200}
                                                    height={40}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                sx={{
                                                    p: 0,
                                                    cursor: "default",
                                                    "&.MuiButtonBase-root:hover":
                                                        {
                                                            bgcolor:
                                                                "transparent",
                                                        },
                                                }}
                                            >
                                                <Skeleton
                                                    variant="rounded"
                                                    width={100}
                                                    height={40}
                                                />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <TableBody>
                                    {walletsData
                                        .slice(
                                            page * rowsPerPage,
                                            page * rowsPerPage + rowsPerPage
                                        )
                                        .map((row, index) => {
                                            return (
                                                <TableRow hover key={index}>
                                                    {columns.map(
                                                        (column, index) => {
                                                            const value =
                                                                row[column.id]
                                                            return (
                                                                <TableCell
                                                                    key={index}
                                                                    align={
                                                                        column.align
                                                                    }
                                                                >
                                                                    {column.id ==
                                                                    "walletAddress" ? (
                                                                        <Box
                                                                            sx={{
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                            }}
                                                                        >
                                                                            <Tooltip
                                                                                title={
                                                                                    value
                                                                                }
                                                                            >
                                                                                <Button
                                                                                    sx={{
                                                                                        cursor: "default",
                                                                                        "&.MuiButtonBase-root:hover":
                                                                                            {
                                                                                                bgcolor:
                                                                                                    "transparent",
                                                                                            },
                                                                                        color:
                                                                                            theme
                                                                                                .palette
                                                                                                .mode ===
                                                                                            "dark"
                                                                                                ? "#FFFFFF"
                                                                                                : "#000000",
                                                                                        mr: "6px",
                                                                                    }}
                                                                                >
                                                                                    {shortner(
                                                                                        value
                                                                                    )}
                                                                                </Button>
                                                                            </Tooltip>
                                                                            {row.type ==
                                                                            "primary" ? (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label="primary"
                                                                                    color="success"
                                                                                    variant="outlined"
                                                                                />
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                        </Box>
                                                                    ) : (
                                                                        ""
                                                                    )}
                                                                </TableCell>
                                                            )
                                                        }
                                                    )}
                                                </TableRow>
                                            )
                                        })}
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                    {walletsData == null ? (
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "end",
                            }}
                        >
                            <Skeleton
                                variant="rounded"
                                width={300}
                                height={30}
                                sx={{ mt: "14px", mr: "18px", mb: "16px" }}
                            />
                        </Box>
                    ) : (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15, 20, 25]}
                            component="div"
                            count={walletsData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default WalletsScreen
