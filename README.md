# Solana Token Holders Snapshot

This project retrieves token holder wallet addresses and their token balances for a specific SPL token on the Solana blockchain using the Tatum SDK. The script queries the Solana RPC endpoint, extracts owner addresses and balances from token accounts, and outputs the results to a CSV file.

## Features

- **Query Solana Token Accounts:**  
  Retrieves all token accounts for a specified token mint.
  
- **Data Extraction:**  
  - Extracts the **owner wallet address** from each token account (bytes 32–64 of account data).
  - Extracts the **token balance** from each token account (bytes 64–72) and formats it using the token's decimals.
  - Removes trailing zeros from the formatted balance.
  
- **Progress Indicator:**  
  Displays a progress bar while processing accounts.

- **Output Files:**  
  - `full_response.json`: The full JSON RPC response for debugging purposes.
  - `token_holders.csv`: A CSV file with two columns (`Owner` and `Balance`), listing each unique token holder and their total balance.

## Prerequisites

- **Node.js:**  
  Download and install from [nodejs.org](https://nodejs.org/). (NPM is installed automatically with Node.js.)

## Installation

1. **Clone the Repository**

   If you have Git installed, open your terminal (or command prompt) and run:
   ```bash
   git clone <repository_url>
   cd sol-holders

2. **Install Dependencies**
    ```bash
    npm install

3. **Configure Environment Variables**

Create a file named .env in the project root with the following content:

    API_KEY=YOUR_API_KEY_HERE
    TOKEN_MINT_ADDRESS=Token mint address
    DECIMALS=
    
    Replace YOUR_API_KEY_HERE with your Tatum API key.
    Replace TOKEN_MINT_ADDRESS with the mint address of the token you want to query.
    Adjust DECIMALS if your token uses a different number of decimal places.
    
## Usage
To run the script, open your terminal in the project directory and run:

    
    npm start
    
## What Happens When You Run the Script
Querying Accounts:
The script uses Tatum’s Solana RPC endpoint to retrieve token accounts for the specified token mint.

Extracting Data:
For each account, the script:

Extracts the owner wallet address (from bytes 32–64).
Extracts the raw token balance (from bytes 64–72 as an 8-byte unsigned integer in little-endian format).
Formats the balance based on the token's decimals (and removes trailing zeros).

Progress Bar:
A progress bar is displayed during processing.

Output Files:

full_response.json: Contains the complete JSON RPC response (for debugging).
token_holders.csv: Contains two columns, Owner and Balance, with unique token holder addresses and their summed token balances.

## Troubleshooting
Environment Variables Missing:
Ensure that your .env file exists in the project root and contains valid values for API_KEY and TOKEN_MINT_ADDRESS.

Node.js Not Installed:
Download and install Node.js from nodejs.org.

Script Errors:
Check the terminal output for error messages. The full RPC response is saved in full_response.json to help with debugging.