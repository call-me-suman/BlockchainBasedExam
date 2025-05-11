import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const client = createThirdwebClient({
  // clientId: "0e1f854c4c9b1a453af2935960947936",
  clientId: `${process.env.CLIENT_ID}`,
});
const add = process.env.NEXT_PUBLIC_ADDRESS as string;
// Connect to your contract
export const contract = getContract({
  client,
  chain: defineChain(11155111), // Sepolia testnet
  // address: "0x17e8FfF2395938B1B45e7e01e5a079E1996662ac"
  address: add,
});
