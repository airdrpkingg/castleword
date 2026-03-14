module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    miniapp: {
      version: "1",
      name: "CastleWord",
      subtitle: "The Crypto Wordle",
      description: "Miniapp project for Farcaster: a daily game in the style of Wordle",
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
};
