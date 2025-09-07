import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export function getClient() {
  return createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
  });
}

export function getContractInstance() {
  const client = getClient();
  return getContract({
    client,
    chain: defineChain(11155111),
    address: process.env.NEXT_PUBLIC_ADDRESS || "",
  });
}
