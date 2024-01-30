## zkSHIELD – A Web-Based Cross-Chain Zero Knowledge Asset Proof

## Abstract
The global transition towards Web3 is propelling the development and 
proliferation of numerous blockchain networks. These diverse blockchains offer distinct 
advantages and serve various purposes, such as Ethereum for decentralized applications, 
Bitcoin for investment, and Polygon for scalability solutions. Each blockchain features its 
own native cryptocurrency, encompassing a wide array of tokens. In response to this 
fragmentation, several prominent blockchain platforms have introduced interoperability 
features, enabling tokens from different chains to coexist through the creation of wrapped 
tokens. As a result, users' assets are distributed across multiple tokens on various 
blockchain networks, further emphasizing the need for seamless cross-chain asset 
management. We have engineered a web application designed to facilitate the 
visualization of user assets across various blockchain networks and wallets. Notably, this 
platform boasts the capability to integrate secondary wallets seamlessly into users' 
accounts. Furthermore, the web application offers comprehensive support for tracking 
the historical trajectory of incoming and outgoing asset proof requests associated with 
individual users. The meta data of a request is securely stored on a blockchain including 
its corresponding proofs' Content Identifier (CID) after zkSNARKs proof generation and 
upon hosting it on the InterPlanetary File System (IPFS)

## Contributions
This paper makes significant contributions to the field of asset verification by employing zkSNARKs to ensure privacy and security. It introduces a specialized circuit capable of 
processing users' net worth information, comparing it against predefined thresholds, and 
ensuring the integrity and accuracy of asset verification within the zkSHIELD system. The use 
of PowerofTau28 MPC for randomness generation during zk-SNARK setup and secure storage 
of .wasm and .zkey files on the server adds an extra layer of protection. The deployment of the 
verifier.sol smart contract on the Polygon Mumbai testnet, along with the Groth16 function 
from the snarkjs library for proof generation, contributes to the robustness of the verification 
process. It addresses scalability challenges by utilizing IPFS for storing proofs, ensuring 
efficient and secure handling of zero-knowledge proof generation. The proposed smart contract 
interacting with Chainlink and token contracts simplifies the collection of token quantities and 
exchange rates, streamlining the net worth calculation process. Overall, the paper presents a 
comprehensive and innovative approach to asset verification, combining cryptographic 
techniques, secure storage practices, user authentication, and efficient proof 
generation mechanisms.

## Proposed Framework
The project employs Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zkSNARKs) to ensure privacy and security in asset verification. To achieve this, we have 
developed a specialized circuit capable of processing users' net worth information, comparing 
it against a predefined threshold determined by the verifier. The generation of randomness 
during the zk-SNARK setup process is facilitated through the use of PowerofTau28 MPC. It's 
noteworthy that the .wasm and .zkey files, integral to the system's operation, are securely stored 
within the confines of the server for added protection. Furthermore, for the verification process, 
we deploy the verifier.sol smart contract, which is created from the .zkey, onto the Polygon 
Mumbai testnet. When a request for proof generation is made, we employ the Groth16 function 
from the snarkjs library to produce the required proof. Subsequently, the verifier.sol smart 
contract evaluates the validity of the proof, thus determining whether it satisfies the specified 
conditions, thereby ensuring the integrity and accuracy of asset verification within the 
zkSHIELD system. 

Within our project framework shown in Fig.1, we have implemented a user registration process 
aimed at ensuring user authenticity and security. New users are required to go dedicated 
registration page, where they are prompted to select a unique username. Additionally, they are 
required to sign a message originating from the wallet they intend to designate as their "primary 
wallet address." This message signing step serves the dual purpose of verifying the user's wallet 
ownership. Once the user successfully provides all necessary registration details, our system 
employs the RSA algorithm to generate a pair of keys. The private key is securely packaged in 
a downloadable .pem file, which is provided to the user. Simultaneously, the public key is 
stored on the Polygon Mumbai testnet. This public key plays a pivotal role in encrypting and 
decrypting data during the handling of incoming and outgoing requests for asset proof within 
the system. To access their account subsequently, users are required to enter their unique 
username, sign a message as an additional security measure, and provide the private key, thus 
ensuring a robust authentication process.
Upon accessing the system, users will be directed to a dedicated dashboard page meticulously 
designed to provide a comprehensive visualization of their assets. This visualization 
encompasses assets held across an array of wallets, blockchain networks, and wrapped tokens.

![Logo](https://github.com/VinayPolisetti/zkShield/blob/main/assets/flowDiagram.jpg?raw=true)
Fig.1 Illustration of the proposed project architecture


We have undertaken the crucial task of calculating net worth, a fundamental element of our 
system's functionality. To illustrate this process as shown in Fig.2, let's consider a user, 
"Bob", who holds a wallet encompassing various assets across different blockchain networks 
such as Ethereum and Polygon. Given the expanding interconnectivity of blockchain networks, 
we encounter a challenge when attempting to aggregate these assets, as their units vary 
significantly. For instance, Ethereum supports its native currency, Ethereum, as well as Bitcoin 
(in the form of wrapped Bitcoin), Matic (in the form of wrapped Matic), and USDC (in the 
form of wrapped USDC). To ascertain Bob's net worth, it is essential to sum the quantities 
of all the tokens held in his wallet. However, performing a direct addition of tokens with 
differing units is unfeasible. This is where the Chainlink network comes into play. Chainlink 
operates as a collection of oracles that deliver reliable real-world data to blockchain networks, 
offering exchange rates for various tokens in terms of US dollars at any given time.

![Logo](https://github.com/VinayPolisetti/zkShield/blob/main/assets/Screenshot%20(116).png?raw=true)
Fig.2 Illustration of the calculation of net worth

With this data at our disposal, the task becomes more straightforward. We can collect the token 
quantities within Bob's wallet, multiply them by the corresponding exchange rates, and 
aggregate the results. This approach remains consistent whether we are assessing the net worth 
of another user, such as "Alice," with a single wallet or even when Bob possesses multiple 
wallets. To facilitate the acquisition of token quantities and exchange rates, our project involves 
the deployment of a smart contract that interacts seamlessly with both Chainlink and token 
contracts. This smart contract acts as an intermediary, orchestrating data retrieval when 
requests are made and subsequently deploying it on the blockchain, thus serving as a valuable 
resource for our application's users.
In our project, we delve into the intricacies of zero-knowledge proof generation as shown in 
Fig.3, an integral component of our system. This process involves two key entities: the verifier 
and the prover. The verifier, who could represent an institution or any party wishing to verify 
an individual's asset worth, sets specific asset thresholds, as is common in educational 
institutions when assessing prospective students. Leveraging the capabilities of the Polygon 
Chain, we undertake the task of zero-knowledge proof generation. The process unfolds with a 
series of meticulously orchestrated steps, encompassing blockchain state reads and decryption. 
This journey commences with the verifier acquiring crucial information, including the 
Verifier's address, the Prover's address, and the predetermined asset threshold. Subsequently, 
a proof request's metadata is created and stored on the blockchain through a transaction that 
includes indicators for the prover's response status (initially set to "0," indicating nonacceptance of the request) and a declaration of "No proof" attached to this record.

![Logo](https://github.com/VinayPolisetti/zkShield/blob/main/assets/Screenshot%20(117).png?raw=true)
Fig.3 Pictorial Representation of the Proof Generation I

If the prover accepts the request, the process advances, with the prover retrieving the record 
from the blockchain. Here, the threshold is extracted, and the prover calculates their net worth, 
which serves as a vital witness in the Groth16 zkSNARK circuit. This circuit, in turn, facilitates 
the production of a proof in a text format. Recognizing that blockchains often grapple with 
scalability and throughput limitations, we opt to store the proof on IPFS (InterPlanetary File 
System), a decentralized protocol for file storage. This move results in the generation of a 
unique Content Identifier (CID), which is returned to the user. At this juncture, the prover 
seeks to amend the record's status to "1" (indicating acceptance or rejection of the request) and 
attaches the CID to the proof (or a "-" symbol to signify rejection), ultimately updating the 
record on the network. For the verifier's benefit, access to the updated record becomes possible 
through the blockchain network. The verifier retrieves the CID, triggering a request to IPFS for 
the associated proof.txt file, ultimately returned to the user. The final phase involves interaction 
with a verifier circuit, deployed as a smart contract on the blockchain by the zkSNARK. 
This circuit, when presented with the proof.txt file, conclusively determines the validity or 
invalidity of the proof, enabling a meticulous and secure assessment of whether the prover's 
assets meet the predefined threshold as shown in Fig.4.

![Logo](https://github.com/VinayPolisetti/zkShield/blob/main/assets/Screenshot%20(118).png?raw=true)
Fig.4 Pictorial Representation of the Proof Generation II

