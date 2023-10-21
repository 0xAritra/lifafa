import { Button } from "antd";
import { AiOutlineCopy } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi";
import { writeContract, waitForTransaction, getAccount } from "@wagmi/core";
import { nft_abi, nft_address } from "../nfts-constants";
import { useContext, useRef, useState } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { readContract } from "@wagmi/core";

const MyNft = () => {
    const [addr, setAddr] = useState(null);
    const { message, notification } = useContext(GlobalContext);
    const isErrorAttempted = useRef(false);
    const account = getAccount();

    async function backendRequest(id) {
        return new Promise(async (resolve, reject) => {
            try {
                var { hash } = await writeContract({
                    address: nft_address,
                    abi: nft_abi,
                    functionName: 'mint',
                    args: [id],
                })
                var transaction = await waitForTransaction({
                    hash: hash
                })
                console.log(transaction);
                resolve(true)
            } catch (err) {
                resolve(err);
            }
        })
    }

    function copytoclipboard(text) {
        navigator.clipboard.writeText(text).then(function () {
            message.success('Copied to clipboard');
        }, function (err) {
            notification.error({
                message: 'Failed to copy to clipboard',
                description: err,
            });
        });
    }

    async function backend_createERCToken() {
        return new Promise(async (resolve, reject) => {
            try {
                var { hash } = await writeContract({
                    address: nft_address,
                    abi: nft_abi,
                    functionName: 'createSimpleERC721Token',
                })
                var transaction = await waitForTransaction({
                    hash: hash
                })
                console.log(transaction);
                resolve(true)
            } catch (err) {
                resolve(err);
            }
        })
    }


    const handleFormSubmit = async e => {
        e.preventDefault();
        //validate form
        if (!addr) {
            notification.error({
                message: 'Invalid Address',
                description: 'Please enter a valid address',
            });
            return;
        };
        //send request
        try {
            message.loading('Minting...', 30);
            var a = await backendRequest(addr);
            message.destroy();
            if (a == true && isErrorAttempted.current == false) {
                message.success('Minted successfully');
            } else {
                if (a.code == 4001) {
                    notification.info({
                        message: 'Failed to mint',
                        description: a.message,
                    });
                    return;
                };
                if (!isErrorAttempted.current) {
                    var b = await backend_createERCToken();
                    isErrorAttempted.current = true;
                    message.success('Contract created successfully. Please try to mint again.');
                } else {
                    notification.info({
                        message: 'Failed to mint',
                        description: a.message,
                    });
                }
            }
        } catch (err) {
            if (!isErrorAttempted.current) {
                var b = await backend_createERCToken();
                isErrorAttempted.current = true;
                message.success('Contract created successfully. Please try to mint again.');
            } else {
                notification.info({
                    message: 'Failed to mint',
                    description: a.message,
                });
            }
        }
    }

    const getcontractaddress = async () => {
        message.loading('Fetching contract address...', 30);
        try {
            var nftsaddr = await readContract({
                address: nft_address,
                abi: nft_abi,
                functionName: 'getNFTAddress',
                args: [account.address],
            })
        } catch (err) {
            await backend_createERCToken();
            // await backendRequest(addr);
            getcontractaddress();
        }
        message.destroy();
        copytoclipboard(nftsaddr);
    }
    return (
        <>
            <h1 className="text-[#C9FF28] font-semibold text-xl uppercase">My NFT</h1>
            <div className="my-6">
                <div className="mx-18">
                    <form onSubmit={handleFormSubmit}>
                        <label className="text-white text-sm font-semibold uppercase">Address</label>
                        <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="0xd15....CfDB" type="text" className="w-full border-[#2d2c2c] border-[1px] focus:outline-none rounded-md p-2 my-2" />
                        <div className="flex w-full justify-end my-4">
                            <div className="flex gap-2 items-center">
                                <Button onClick={getcontractaddress} className="flex items-center gap-1" size="large"><AiOutlineCopy className="text-xl" /> Contract Address</Button>
                                <Button className="flex items-center gap-1" size="large" htmlType="submit" type="primary"><HiOutlineSparkles /> Mint</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default MyNft;