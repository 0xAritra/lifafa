import { Button, ConfigProvider, Modal, theme } from "antd"
import { useContext, useEffect, useRef, useState } from "react"
import "../css-addons/envelope.css"
import "animate.css"
import { GlobalContext } from "../contexts/globalContext"
import ConfettiExplosion from "react-confetti-explosion"
import { useNavigate, useParams } from "react-router-dom"
import { FrownOutlined } from "@ant-design/icons"
import Aos from "aos"
import "aos/dist/aos.css"
import { readContract, writeContract } from "@wagmi/core"
import { contract_abi, contract_address } from "../constants"
import { waitForTransaction } from "@wagmi/core"
import { formatEther, parseEther } from "viem"
import BigNumber from "bignumber.js"
import { Biconomy } from "@biconomy/mexa"
import { Contract } from "ethers"
import { useAccount } from "wagmi"

const ClaimReward = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isClaimed = useRef(false)
  const isMounted = useRef(false)
  const { message, notification } = useContext(GlobalContext)
  const [isCardOpen, setCardOpen] = useState(false)
  const [isAmountVisible, setisAmountVisible] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [amount, setAmount] = useState(false)
  const [status, setStatus] = useState(false)
  const [addAmountModalVisibility, setAddAmountModalVisibility] = useState(false)
  const [addAmount, setAddAmount] = useState(null)

  const { address } = useAccount()

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      Aos.init()
      if (!id || id === "") {
        notification.error({
          message: "Invalid URL",
          description: "Please check the URL and try again",
        })
        navigate("/")
        return
      }
    }
  }, [])

  const blockchain_AddFunds = async (id) => {
    return new Promise(async (resolve, reject) => {
      // {status: '<success || any error message>'}
      //backend call
      // setTimeout(() => {
      //     resolve({
      //         status: 'success',
      //     });
      // }, 2000);
      try {
        var { hash } = await writeContract({
          address: contract_address,
          abi: contract_abi,
          functionName: "addToEnvelope",
          args: [id],
          value: parseEther(addAmount),
        })
        var transaction = await waitForTransaction({
          hash: hash,
        })
        console.log(transaction)
        resolve({
          status: "success",
        })
      } catch (e) {
        console.log(e)
        resolve({
          status: e.message,
        })
        return
      }
    })
  }

  const blockchainProcess = async (id) => {
    return new Promise(async (resolve, reject) => {
      // {status: '<success || any error message>', amount: '$<int>', remaining_amount: '<int>'}
      //backend call
      // setTimeout(() => {
      //     resolve({
      //         status: 'success',
      //         amount: '$100'
      //     });
      // }, 2000);

      var check = await readContract({
        address: contract_address,
        abi: contract_abi,
        functionName: "isInvalidID",
        args: [id],
      })
      if (check) {
        resolve({
          status: "Invalid redeem id",
          amount: null,
        })
        return
      }
      //redeem
      try {
        // var { hash } = await writeContract({
        //     address: contract_address,
        //     abi: contract_abi,
        //     functionName: 'claim',
        //     args: [id]
        // })
        // var transaction = await waitForTransaction({
        //     hash: hash
        // })
        // console.log(transaction);

        let biconomy = new Biconomy(window.ethereum, {
          apiKey: process.env.REACT_APP_BICONOMY_KEY,
          debug: true,
          contractAddresses: [contract_address],
        })
        const provider = biconomy.provider
        // console.log(provider)

        const contractInstance = new Contract(
          contract_address,
          contract_abi,
          biconomy.ethersProvider
        )
        console.log(contractInstance)

        const { data } = await contractInstance.claim.populateTransaction(id)

        console.log(data)

        let txParams = {
          data: data,
          to: contract_address,
          from: address,
          signatureType: "EIP712_SIGN",
          gasLimit: 5000000,
        }

        await biconomy.init()

        const tx = await provider.send("eth_sendTransaction", [txParams])
        console.log(tx)

        biconomy.on("txHashGenerated", (data) => {
          console.log(data)
          // showSuccessMessage(`tx hash ${data.hash}`);
        })
        biconomy.on("txMined", (data) => {
          console.log(data)
          // showSuccessMessage(`tx mined ${data.hash}`);
          // fetchQuote();
        })

        // resolve({
        //   status: "success",
        //   amount: formatEther(BigNumber(transaction["logs"][0]["data"])).toString().substring(0, 8),
        // })
      } catch (e) {
        console.log(e)
        resolve({
          status: e.message,
          amount: null,
        })
        return
      }
    })
  }

  const handleEnvelopeClick = async () => {
    if (processing) return
    if (isClaimed.current) return
    setProcessing(true)
    message.loading("Processing request...", 30)

    //sending request to blockchain
    var resp = await blockchainProcess(id)

    message.destroy()
    setProcessing(false)
    isClaimed.current = true
    setCardOpen(true)

    //validate response
    setStatus(resp.status)
    if (resp.status == "success") {
      setTimeout(() => {
        setAmount(resp.amount)
        setisAmountVisible(true)
        setTimeout(() => {
          setIsExploding(true)
        }, 400)
      }, 800)
    }
  }

  const handleAddFundSubmit = (e) => {
    e.preventDefault()
    //validate
    if (!addAmount || addAmount == "") {
      notification.error({
        message: "Invalid amount",
        description: "Please enter valid amount",
      })
      return
    }
    if (isNaN(addAmount)) {
      notification.error({
        message: "Invalid amount",
        description: "Please enter valid amount",
      })
      return
    }
    message.loading("Adding funds...", 30)
    //backend call
    blockchain_AddFunds(id).then((resp) => {
      message.destroy()
      setAddAmountModalVisibility(false)
      if (resp.status == "success") {
        notification.success({
          message: "Funds added",
          description: "Funds added successfully",
        })
      } else {
        notification.error({
          message: "Error",
          description: resp.status,
        })
      }
    })
  }

  return (
    <>
      <h1
        data-aos-delay={1000}
        data-aos="fade-down"
        className="text-[#fff] text-center font-semibold"
      >
        You recieved an Gift. Click on the Envelope to open it.
      </h1>
      <div className="flex flex-col gap-2 h-[80dvh] items-center justify-center">
        <div className={`${processing ? "animate-pulse cursor-not-allowed" : ""}`}>
          <div
            onClick={handleEnvelopeClick}
            className={`envelope animate__animated animate__fadeInDownBig relative cursor-pointer ${
              isCardOpen ? "card-open" : ""
            }`}
          >
            <div className="back relative w-[250px] h-[200px] bg-[#e50530]"></div>
            <div className="letter absolute bg-white box-shadow w-[230px] h-[180px] top-[10px] left-[10px] transition delay-300">
              {(isCardOpen && status == "success" && (
                <>
                  <div className="text-center text-2xl mt-[20px] font-bold animate__animated animate__fadeInUp">
                    You've won
                  </div>
                  {isAmountVisible && (
                    <div className="text-center text-xl font-semibold animate__animated animate__fadeInUp">
                      <div className="flex gap-1 w-full items-center justify-center">
                        <span className="text-xl">🎉</span>
                        <span>{amount}</span>
                        {isExploding && (
                          <ConfettiExplosion
                            force={0.8}
                            duration={3000}
                            particleCount={250}
                            width={window.innerWidth}
                            height={document.documentElement.scrollHeight}
                          />
                        )}
                        <span className="text-xl">🎉</span>
                      </div>
                    </div>
                  )}
                </>
              )) || (
                <>
                  <div className="flex justify-center text-2xl mt-[20px] font-bold animate__animated animate__fadeInUp">
                    <FrownOutlined className="text-6xl" />
                  </div>
                  <div className="text-center  text-lg mt-[20px] font-bold animate__animated animate__fadeInUp">
                    Error
                  </div>
                </>
              )}
            </div>
            <div className="front"></div>
            <div className="top"></div>
            <div className="shadow"></div>
          </div>
        </div>
        {status != "success" && (
          <div className="text-center text-[#C9FF28] text-base mt-[20px] font-bold animate__animated animate__fadeInUp">
            {status}
          </div>
        )}

        <div className="flex flex-col gap-2 justify-end items-end">
          {/* <Button onClick={e => navigate('/')} type="primary">Add 💸 to this 🧧</Button> */}
          <button
            onClick={(e) => setAddAmountModalVisibility(true)}
            data-aos-delay={200}
            data-aos="fade-up"
            className="border-[#c9ff28] border-[2px] text-white text-lg rounded-sm flex gap-2 px-3 py-2 items-center font-semibold"
          >
            Add 💸 to this 🧧
          </button>
          <p onClick={(e) => navigate("/")} className="cursor-pointer text-[#c9ff28]">
            Create your own 🧧
          </p>
        </div>
        <ConfigProvider
          theme={{
            algorithm: theme.lightAlgorithm,
          }}
        >
          <Modal
            open={addAmountModalVisibility}
            footer={null}
            centered
            title={
              <>
                Add funds to this 🧧 <small className="font-bold">({id})</small>
              </>
            }
            onCancel={(e) => setAddAmountModalVisibility(false)}
            destroyOnClose={true}
          >
            <form onSubmit={handleAddFundSubmit}>
              <div className="my-2 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold">Enter funds to be added *</label>
                  <input
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="border-[1px] focus:outline-none box-shadow rounded-md px-2 py-2"
                  />
                </div>
                <div className="flex justify-end">
                  <Button htmlType="submit" type="primary">
                    Add 💸
                  </Button>
                </div>
              </div>
            </form>
          </Modal>
        </ConfigProvider>
      </div>
    </>
  )
}

export default ClaimReward
