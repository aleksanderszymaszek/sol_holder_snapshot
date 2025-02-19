import dotenv from "dotenv";
dotenv.config();
import { TatumSDK, Solana, Network } from "@tatumio/tatum";
import fs from "fs";
import bs58 from "bs58";
import cliProgress from "cli-progress";

function formatBalance(rawBalance, decimals) {
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = rawBalance / divisor;
  const remainder = rawBalance % divisor;

  let remainderStr = remainder.toString().padStart(decimals, "0");
  remainderStr = remainderStr.replace(/0+$/, "");

  return remainderStr === ""
    ? integerPart.toString()
    : `${integerPart.toString()}.${remainderStr}`;
}

async function getTokenHoldersSnapshot() {
  const apiKey = process.env.API_KEY;
  const tokenMintAddress = process.env.TOKEN_MINT_ADDRESS;

  if (!apiKey || !tokenMintAddress) {
    console.error("Missing API_KEY or TOKEN_MINT_ADDRESS in the .env file.");
    process.exit(1);
  }

  const tatum = await TatumSDK.init({
    network: Network.SOLANA,
    apiKey: apiKey,
  });

  try {
    const tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

    const decimals = Number(process.env.DECIMALS) || 9;

    const filters = [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: tokenMintAddress } },
    ];

    const options = {
      commitment: "finalized",
      encoding: "base64",
      withContext: true,
      filters: filters,
    };

    console.log("Fetching token holder snapshot via Tatum SDK...");
    const res = await tatum.rpc.getProgramAccounts(tokenProgramId, options);

    fs.writeFileSync("full_response.json", JSON.stringify(res, null, 2));
    console.log('Full JSON response saved to "full_response.json".');

    const accounts = res.result ? res.result.value : res.value || [];
    console.log(`Found ${accounts.length} token accounts.`);

    const progressBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );
    progressBar.start(accounts.length, 0);

    const rows = [];
    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const dataBase64 = acc.account.data[0];
      const dataBuffer = Buffer.from(dataBase64, "base64");

      const ownerBytes = dataBuffer.slice(32, 64);
      const owner = bs58.encode(ownerBytes);

      const rawBalance = dataBuffer.readBigUInt64LE(64);
      const humanBalance = formatBalance(rawBalance, decimals);

      rows.push({ owner, balance: humanBalance });
      progressBar.update(i + 1);
    }
    progressBar.stop();

    const ownerMap = new Map();
    for (const row of rows) {
      const current = ownerMap.get(row.owner) || BigInt(0);
      ownerMap.set(row.owner, current + BigInt(row.balance.replace(".", "")));
    }
    const uniqueRows = [];
    for (const [owner, totalRaw] of ownerMap.entries()) {
      const totalBalance = formatBalance(totalRaw, decimals);
      uniqueRows.push({ owner, balance: totalBalance });
    }
    console.log(`Found ${uniqueRows.length} unique token holder addresses.`);

    let csvContent = "Owner,Balance\n";
    uniqueRows.forEach((row) => {
      csvContent += `${row.owner},${row.balance}\n`;
    });
    fs.writeFileSync("token_holders.csv", csvContent);
    console.log('CSV file "token_holders.csv" saved successfully.');
  } catch (error) {
    console.error("Error fetching token holders:", error);
  } finally {
    await tatum.destroy();
  }
}

getTokenHoldersSnapshot();
