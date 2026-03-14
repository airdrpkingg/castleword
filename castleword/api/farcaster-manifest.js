module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    accountAssociation: {
      header: "eyJmaWQiOjI1Mzk4MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAyMTc0NDJiMTdlYjBkQUQ4MmI1NUQ5NjZBYzQwN2YxMkZiOEQxMEUifQ",
      payload: "eyJkb21haW4iOiJjYXN0bGV3b3JkYWlyZHJwa2luZy52ZXJjZWwuYXBwIn0",
      signature: "tU4nSIj6u1ED8+pNDXdvoRUHQQmCBHO3z7PDDahKSvlIOp7Mdg1OkFE+iTt9xjvkLn+N+HpoMdDRShaVd5fq0Bs="
    },
    miniapp: {
      version: "1",
      name: "CastleWord",
      subtitle: "The Crypto Wordle",
      description: "A daily crypto word game for Farcaster",
      iconUrl: "https://castlewordairdrpking.vercel.app/icon.png",
      homeUrl: "https://castlewordairdrpking.vercel.app",
      imageUrl: "https://castlewordairdrpking.vercel.app/og.png",
      splashImageUrl: "https://castlewordairdrpking.vercel.app/splash.png",
      splashBackgroundColor: "#f2f2f7",
      buttonTitle: "Play today's word",
      webhookUrl: "https://castlewordairdrpking.vercel.app/api/webhook",
      primaryCategory: "games",
      tags: ["game", "crypto", "wordle", "farcaster"]
    }
  });
};
