async function isMemeHolder(address: string): Promise<boolean> {
    const pr_t = "https://rpc.eu-north-1.gateway.fm/v4/ethereum/non-archival/mainnet"
    const pr = new ethers.providers.JsonRpcProvider(pr_t);
    const memeContrats = [
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933", 
    "0xAC57De9C1A09FeC648E93EB98875B212DB0d460B", 
    "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E",
    "0xc5fB36dd2fb59d3B98dEfF88425a3F425Ee469eD",
    "0x27C70Cd1946795B66be9d954418546998b546634",
    "0xcA75C43f8c9AfD356c585ce7AA4490B48A95C466",
    "0xA2b4C0Af19cC16a6CfAcCe81F192B024d625817D",
    "0x12970E6868f88f6557B76120662c1B3E50A646bf",
    "0x6Bc40d4099f9057b23aF309C08d935b890d7Adc0",
    "0xa71d0588EAf47f12B13cF8eC750430d21DF04974",
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3",
    "0x12b6893ce26ea6341919fe289212ef77e51688c8",
    "0x7a58c0be72be218b41c608b7fe7c5bb630736c71",
    "0xafcdd4f666c84fed1d8bd825aa762e3714f652c9",
    "0x9813037ee2218799597d83d4a5b6f3b6778218d9",
    "0x5026f006b85729a8b14553fae6af249ad16c9aab",
    ]

    for (let i = 0; i < memeContrats.length; i++) {
    const c = new ethers.Contract(memeContrats[i], [
        "function balanceOf(address) view returns (uint)",
    ], pr);


    const balance = await c.balanceOf(address);
    if (balance > 0) {  
        return true;
    }
    }

    return false;
}