import "./App.css"
import { Route, Routes } from "react-router-dom"
import ClaimReward from "./pages/claim"
import LandingPage from "./pages/landing"
import Navbar from "./components/navbar"
import CreateLink from "./pages/create-link"
import RedeemLanding from "./pages/redeem-input"
import "@rainbow-me/rainbowkit/styles.css"
import { connectorsForWallets, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { polygonMumbai } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"
import MyNft from "./pages/my-nft"
import { injectedWallet, metaMaskWallet, oktoWallet } from "@rainbow-me/rainbowkit/wallets"
const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [/* alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), */ publicProvider()]
)

// const { connectors } = getDefaultWallets({
//   appName: "Lifafa",
//   projectId: "YOUR_PROJECT_ID",
//   chains,
// })

const projectId = process.env.REACT_APP_PROJECT_ID

const connectors = connectorsForWallets([
  {
    groupName: "Suggested",
    wallets: [
      // rainbowWallet({ projectId, chains }),
      oktoWallet({
        chains,
        projectId,
        walletConnectOptions: {
          projectId,
          metadata: {
            name: "Lifafa", //mandatory
            description: "DAPP_DESCRIPTION",
            url: "https://dapp.xyz/",
            icons: ["https://dapp.xyz/icon.png"],
          },
        },
        walletConnectVersion: "2",
      }),
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      // walletConnectWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

function App() {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <Navbar />
          <div className="my-8 md:mx-20 mx-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/redeem" element={<RedeemLanding />} />
              <Route path="/redeem/:id?" element={<ClaimReward />} />
              <Route path="/create-link" element={<CreateLink />} />
              <Route path="/my-nft" element={<MyNft />} />
            </Routes>
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  )
}

export default App
