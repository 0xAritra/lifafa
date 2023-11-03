import Aos from "aos"
import { useContext, useEffect, useRef, useState } from "react"
import { AiOutlineArrowRight, AiOutlineFieldTime } from "react-icons/ai"
import { GlobalContext } from "../contexts/globalContext"
import {
  DatePicker,
  TimePicker,
  ConfigProvider,
  theme,
  Modal,
  Spin,
  QRCode,
  Popconfirm,
} from "antd"
import dayjs from "dayjs"
import CompanyHistoryCard from "../components/history"
import "aos/dist/aos.css"
import { writeContract } from "@wagmi/core"
import { contract_abi, contract_address } from "../constants"
import { formatEther, parseEther, parseGwei } from "viem"
import { readContract, waitForTransaction } from "@wagmi/core"
// const ethers = require('ethers');
// const provider = new ethers.BrowserProvider(window.ethereum);
import bigInt from "big-integer"
import BigNumber from "bignumber.js"
import { getAccount, readContracts } from "@wagmi/core"
import { nft_abi, nft_address } from "../nfts-constants"
import { useAccount, useNetwork, useWalletClient } from "wagmi"
import { Biconomy } from "@biconomy/mexa"
import { BrowserProvider, Contract, ethers } from "ethers"
import { Web3Provider } from "@ethersproject/providers"
import { Interface } from "@ethersproject/abi"

const CreateLink = () => {
  const isMounted = useRef(false)
  const [funds, setFunds] = useState(null)
  const [secondsTimeLimit, setSecondsTimeLimit] = useState(null)
  const [timeLimit, setTimeLimit] = useState(null)
  const [timeLimitDate, setTimeLimitDate] = useState(null)
  const [NFTSAddress, setNFTSAddress] = useState(null)
  const { notification, message, history } = useContext(GlobalContext)
  // const [history, setHistory] = useState([]); // [{url: 'some url', amount: 1000}]
  const [historyLoading, setHistoryLoading] = useState(true)
  const yesterday = dayjs().subtract(1, "day").endOf("day")
  const [share_url, setShare_url] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { address } = useAccount()
  const { chain } = useNetwork()
  // const { data: signer } = useWalletClient()

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      Aos.init()
    }
  }, [])

  useEffect(() => {
    if (history.reload.get()) {
      if (history.get().length == 0) {
        backend_fetchHistory()
        history.reload.set(false)
      }
    }
  }, [history.reload.get()])

  //
  // useEffect(() => {
  //   const initBiconomy = async () => {
  //     //   setBackdropOpen(true);
  //     console.log("Initializing Biconomy ...")
  //     // const provider = new BrowserProvider(window.ethereum)
  //     // // It will prompt user for account connections if it isnt connected
  //     // const signer = await provider.getSigner()

  //     // console.log(signer)
  //     biconomy = new Biconomy(window.ethereum, {
  //       apiKey: "Bp-bXL0Xh.7c4da858-f87d-4600-9899-6316499975e7",
  //       debug: true,
  //       contractAddresses: [contract_address],
  //     })
  //     console.log(biconomy)
  //     await biconomy.init()
  //   }
  //   // if (address && chain && signer?.provider)
  //   initBiconomy()
  // }, [address, chain, signer?.provider])

  const backendRequest = async (data = {}) => {
    return new Promise(async (resolve, reject) => {
      // {status: '<success || any error message>', link: '<url>'}
      // console.log("Initializing Biconomy ...")
      // let biconomy = new Biconomy(window.ethereum, {
      //   apiKey: "",
      //   debug: true,
      //   contractAddresses: [contract_address],
      // })
      // const provider = biconomy.provider
      // // console.log(provider)

      // const contractInstance = new Contract(contract_address, contract_abi, biconomy.ethersProvider)
      // console.log(contractInstance)

      // const { data } = await contractInstance.createEnvelope.populateTransaction(
      //   input.seconds,
      //   input.NFTSAddress
      // )

      // console.log(data)
      // console.log(parseEther(input.funds))

      // let txParams = {
      //   data: data,
      //   value: parseEther(input.funds),
      //   to: contract_address,
      //   from: address,
      //   signatureType: "EIP712_SIGN",
      // }

      // await biconomy.init()

      // await provider.send("eth_sendTransaction", [txParams])

      const { hash } = await writeContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "createEnvelope",
        value: parseEther(data.funds),
        args: [data.seconds, data.NFTSAddress],
      })
      var transaction = await waitForTransaction({
        hash: hash,
      })
      var hex = transaction["logs"][0]["data"]
      var id = BigNumber(hex).toString()
      resolve({
        status: "success",
        link: window.location.protocol + "//" + window.location.hostname + "/redeem/" + id,
        transaction: transaction,
      })
      //   onSubmit()
      message.loading("Reloading history...", 30)
      history.set([])
      history.reload.set(true)
      backend_fetchHistory()
    })
  }

  async function backend_fetchHistory() {
    return new Promise(async (resolve, reject) => {
      // {status: '<success || any error message>', link: '<url>'}
      // const { account } = await getWalletClient();
      const account = getAccount()
      // console.log(await getWalletClient())
      const data = await readContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "getHistory",
        args: [],
        account,
      })
      var data_arr = data
      var history_array = []
      data_arr.map(async (item, index) => {
        var history_obj = {}
        data_arr[index] = BigNumber(item).toString()
        const __t = await readContract({
          address: contract_address,
          abi: contract_abi,
          functionName: "envelopes",
          args: [data_arr[index]],
          account,
        })
        __t.forEach((element, key) => {
          history_obj = {}
          history_obj["url"] =
            window.location.protocol +
            "//" +
            window.location.hostname +
            "/redeem/" +
            data_arr[index]
          history_obj["amount"] = formatEther(BigNumber(__t[0]))
          //calculate if the link is expired or not
          var currentTimeStampInUnix = Math.floor(Date.now() / 1000)
          if (currentTimeStampInUnix > __t[1] + __t[2]) {
            history_obj["reclaim"] = true
          } else {
            history_obj["reclaim"] = false
          }
        })
        history_array.push(history_obj)
      })
      history.set(history_array)
      resolve(true)
      // resolve(data);
    })
    // const signer = provider.getSigner()
    // const contract = new ethers.Contract(contract_address, contract_abi, signer)
    // const history = await contract.getHistory()
    // console.log(history);
  }

  async function loadPageData() {
    setHistoryLoading(true)
    if (history.get().length == 0) {
      var data = await backend_fetchHistory()
    }
    message.destroy()
    setHistoryLoading(false)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    var nftsAddr = "0x0000000000000000000000000000000000000000"
    //validate form
    if (!funds || !timeLimit || !timeLimitDate) {
      notification.error({
        message: "Invalid form",
        description: "Please fill all the fields",
      })
      return
    }
    if (NFTSAddress && NFTSAddress != "") {
      nftsAddr = NFTSAddress
    }
    //validate funds
    if (isNaN(funds) || funds < 0) {
      notification.error({
        message: "Invalid funds",
        description: "Please enter a valid amount",
      })
      return
    }

    //calculate seconds from the selected time and date from now
    var seconds = dayjs(timeLimitDate).diff(dayjs(), "second")
    seconds += dayjs(timeLimit).diff(dayjs(), "second")
    setSecondsTimeLimit(seconds)
    if (seconds < 0) {
      notification.error({
        message: "Invalid time",
        description: "Please select a valid time",
      })
      return
    }
    const __req = async () => {
      //send request to backend
      message.loading("Generating link...", 30)
      var resp = await backendRequest({
        funds: funds,
        seconds: seconds,
        NFTSAddress: nftsAddr,
      })
      message.destroy()
      if (resp.status !== "success") {
        notification.error({
          message: "Error",
          description: resp.status,
        })
      } else {
        setShare_url(resp.link)
        setIsModalOpen(true)
      }
    }
    __req()
  }
  const openSystemShareMenu = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Red Envelope",
          text: "Red Envelope",
          url: share_url,
        })
        .then(() => {
          message.success("Shared successfully")
        })
        .catch((err) => {
          notification.error({
            message: "Failed to share",
            description: err,
          })
        })
    } else {
      notification.error({
        message: "Failed to share",
        description: "Your browser does not support this feature",
      })
    }
  }
  const copytoclipboard = () => {
    navigator.clipboard.writeText(share_url).then(
      function () {
        message.success("Copied to clipboard")
      },
      function (err) {
        notification.error({
          message: "Failed to copy to clipboard",
          description: err,
        })
      }
    )
  }
  useEffect(() => {
    loadPageData()
  }, [])

  const handleGetNFTAddress = async (e) => {
    message.loading("Fetching NFT address...", 30)
    var addr = await readContracts({
      address: nft_address,
      abi: nft_abi,
      functionName: "getNFTAddress",
    })
    message.destroy()
    console.log(addr)
  }
  return (
    <>
      <div className="font-[Montserrat] mx-6">
        <form
          className="flex gap-8 flex-col"
          //   onSubmit={onSubmit}
          onSubmit={handleFormSubmit}
        >
          <div data-aos-delay={100} data-aos="fade-up" className="flex flex-col gap-2">
            <label className="text-[#C9FF28] font-semibold text-sm uppercase">
              Enter funds to be added *
            </label>
            <input
              type="number"
              value={funds}
              onChange={(e) => setFunds(e.target.value)}
              className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold"
            />
          </div>
          <ConfigProvider
            theme={{
              algorithm: theme.lightAlgorithm,
            }}
          >
            <div data-aos-delay={200} data-aos="fade-up" className="flex flex-col gap-2">
              <label className="text-[#C9FF28] font-semibold text-sm uppercase">Time Limit *</label>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <DatePicker
                  className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold"
                  onChange={(e) => setTimeLimitDate(e)}
                  placeholder="Date"
                  value={timeLimitDate}
                  disabledDate={(current) => {
                    return current && current < yesterday
                  }}
                />
                <div data-aos="fade-up" className="w-full">
                  <TimePicker
                    className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold"
                    onChange={(e) => setTimeLimit(e)}
                    placeholder="Time"
                    format={"HH:mm: A"}
                    value={timeLimit}
                  />
                </div>
              </div>
            </div>
          </ConfigProvider>
          <div data-aos-delay={300} data-aos="fade-up" className="flex flex-col gap-2">
            <label className="text-[#C9FF28] font-semibold text-sm w-full flex justify-between items-center">
              <div>
                NFTs ADDRESS <small>(optional)</small>
              </div>
              <div
                onClick={handleGetNFTAddress}
                className="text-sm cursor-pointer hover:underline underline-offset-4"
              >
                Get your NFT Address
              </div>
            </label>
            <input
              value={NFTSAddress}
              onChange={(e) => setNFTSAddress(e.target.value)}
              className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold"
            />
          </div>
          <div className="my-4 flex ">
            <ConfigProvider
              theme={{
                algorithm: theme.lightAlgorithm,
              }}
            >
              <Popconfirm
                title="Are you sure you want to create this link?"
                onConfirm={handleFormSubmit}
                // onConfirm={onSubmit}
                okText="Yes"
                cancelText="No"
                placement="top"
              >
                <button
                  type="button"
                  className="bg-[#c9ff28] rounded-sm flex gap-2 px-3 py-2 items-center font-semibold"
                >
                  Generate Link <AiOutlineArrowRight className="text-xl" />
                </button>
              </Popconfirm>
            </ConfigProvider>
          </div>
        </form>
        <div className="my-4">
          <h1
            data-aos-delay={500}
            data-aos="fade-up"
            className="text-white font-semibold flex items-center text-xl gap-1 uppercase"
          >
            <AiOutlineFieldTime className="text-2xl" /> My Envelopes
          </h1>
          <div data-aos-delay={600} data-aos="fade-up">
            <Spin spinning={historyLoading}>
              <CompanyHistoryCard data={history} flagRefresh={loadPageData} />
            </Spin>
          </div>
        </div>
      </div>
      <ConfigProvider
        theme={{
          algorithm: theme.lightAlgorithm,
        }}
      >
        <Modal
          open={isModalOpen}
          title={null}
          footer={null}
          width={450}
          className="font-[Montserrat] share-modal"
          onCancel={(e) => setIsModalOpen(false)}
        >
          <div className="pt-4">
            <div className="flex items-center justify-center flex-col h-full my-6">
              <div id="qr-code">
                <QRCode size={170} value={share_url} color="#c9ff28" bgColor="#0b0a0a" />
              </div>
              <p className="mx-8 font-semibold my-4">
                The link is generated and your red envelope is ready to be shared.
              </p>
            </div>
            <div className="grid grid-cols-2">
              <div
                onClick={openSystemShareMenu}
                className="flex justify-center items-center bg-[#616f39] p-3 cursor-pointer text-white font-semibold"
              >
                Share
              </div>
              <div
                onClick={copytoclipboard}
                className="flex justify-center items-center bg-[#a7d129] p-3 cursor-pointer text-white font-semibold"
              >
                Copy
              </div>
            </div>
          </div>
        </Modal>
      </ConfigProvider>
    </>
  )
}

export default CreateLink
