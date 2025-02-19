import fs from "fs";
import bs58 from "bs58";


const rawResponse = JSON.parse(fs.readFileSync("full_response.json", "utf8"));

const accounts = rawResponse.result.value;

const targetOwner = "Fqr4RwMwZ7qv6qGqQqqVWccAuU89DJZStaXyMCjBVRDV";

let foundAccount = null;

accounts.forEach((acc) => {
  const dataBase64 = acc.account.data[0];
  const dataBuffer = Buffer.from(dataBase64, "base64");
  const ownerBytes = dataBuffer.slice(32, 64);
  const ownerAddress = bs58.encode(ownerBytes);

  if (ownerAddress === targetOwner) {
    foundAccount = acc;
  }
});

if (foundAccount) {
  console.log("Found the account with the target owner address:", foundAccount);
} else {
  console.log("No account with the target owner address was found.");
}
