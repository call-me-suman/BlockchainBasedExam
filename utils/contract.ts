import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const client = createThirdwebClient({
  // clientId: "0e1f854c4c9b1a453af2935960947936",
  clientId: "f74a735820f866854c58f30896bc36a5",
});

// Connect to your contract
export const contract = getContract({
  client,
  chain: defineChain(11155111), // Sepolia testnet
  // address: "0x17e8FfF2395938B1B45e7e01e5a079E1996662ac"
  address: "0x34b9fd9b646ade28fdd659bf34edd027c60445b1",
});
