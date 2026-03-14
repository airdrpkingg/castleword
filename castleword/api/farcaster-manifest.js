// api/farcaster-manifest.js
// Serves the Farcaster miniapp manifest at /.well-known/farcaster.json
// This bypasses Vercel's issue with serving dot-folders as static files.

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    accountAssociation: {
      header: process.env.FC_HEADER || "PASTE_HEADER_HERE",
      payload: process.env.FC_PAYLOAD || "PASTE_PAYLOAD_HERE",
      signature: process.env.FC_SIGNATURE || "PASTE_SIGNATURE_HERE"
    },
    miniapp: {
      version: "1",
      name: "CastleWord",
      subtitle: "Daily crypto word game",
      description: "Guess the daily 5-letter crypto/web3 word. Compete on the global Farcaster leaderboard.",
      iconUrl: "https://castlewordairdrpking.vercel.app/icon.png",
      homeUrl: "https://castlewordairdrpking.vercel.app",
      imageUrl: "https://castlewordairdrpking.vercel.app/og.png",
      splashImageUrl: "https://castlewordairdrpking.vercel.app/splash.png",
      splashBackgroundColor: "#f2f2f7",
      buttonTitle: "🏰 Play today's word",
      webhookUrl: "https://castlewordairdrpking.vercel.app/api/webhook",
      primaryCategory: "games",
      tags: ["game", "crypto", "wordle", "farcaster", "web3", "daily"]
    }
  });
}
