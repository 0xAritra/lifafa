import { Button, Modal, Spin, Table, Tooltip } from "antd";
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { AiOutlineCopy, AiOutlineReload } from 'react-icons/ai';
import { FC } from 'react';
import { waitForTransaction, writeContract } from "@wagmi/core";
import { contract_abi, contract_address } from "../constants";

// interface CompanyHistoryCardProps {
//     data: {
//         url: string;
//         amount: number;
//         reclaim: Boolean;
//     }[];
//     flagRefresh: () => void;
// }
function extractIdFromUrl(url) {
    const parts = url.split('/');
    const id = parts[parts.length - 1];
    return id;
}
const CompanyHistoryCard = () => {
    const { message, notification, history } = useContext(GlobalContext);
    const isMounted = useRef(false);
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            if (history.get.length === 0) {
                const interval = setInterval(() => {
                    if (history.get().length > 0) {
                        clearInterval(interval);
                        return;
                    }
                    history.reload.set(true);
                }, 5000)
            }
        }
    }, [])
    const copytoclipboard = (text) => {
        navigator.clipboard.writeText(text).then(function () {
            message.success('Copied to clipboard');
        }, function (err) {
            notification.error({
                message: 'Failed to copy to clipboard',
                description: err,
            });
        });
    }

    const backendRequest = async (data = 0) => {
        return new Promise(async (resolve, reject) => { // {status: '<success || any error message>', link: '<url>'}
            // setTimeout(() => {
            //     resolve({
            //         status: 'success',
            //     })
            // }, 2000)
            try {
                var { hash } = await writeContract({
                    address: contract_address,
                    abi: contract_abi,
                    functionName: 'reclaim',
                    args: [data]
                })
                var transaction = await waitForTransaction({
                    hash: hash
                })
                console.log(transaction);
                resolve({
                    status: 'success',
                });
            } catch (err) {
                notification.error({
                    message: 'Failed to reclaim',
                    description: err,
                });
            }
        })
    }


    const sampleData = [
        {
            url: 'https://www.google.com',
            amount: 1000,
            reclaim: true
        }
    ];

    const dataSource = [];

    const handleCopyBtnClick = async (url, reclaim = false) => {
        if (!reclaim && reclaim == false) {
            copytoclipboard(url);
            return;
        } else {
            Modal.confirm({
                title: 'Reclaim funds',
                content: 'Are you sure you want to reclaim funds?',
                okText: 'Yes',
                cancelText: 'No',
                onOk: async () => {
                    //backend call
                    message.loading('Reclaiming funds...', 30);
                    var resp = await backendRequest(extractIdFromUrl(url));
                    message.destroy();
                    if (resp.status == 'success') {
                        // flagRefresh();
                        history.set([]);
                        history.reload.set(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000)
                        notification.success({
                            message: 'Reclaimed successfully',
                            description: 'The funds has been reclaimed to your account',
                        });
                    } else {
                        notification.error({
                            message: 'Failed to reclaim',
                            description: resp.status,
                        });
                    }
                }
            });
        }
    }

    const mapElement = (data) => {
        data.map((item, index) => {
            dataSource.push({
                sno: index + 1 + ')',
                amount: <>{item.amount}</>,
                url: <>
                    {
                        item.amount != 0 && <a href={item.url} className="hover:underline underline-white underline-offset-4 hover:text-white" target="_blank" rel="noopener noreferrer nofollow">{item.url}</a>
                        || <span className="text-gray-400 cursor-not-allowed"><del>{item.url}</del></span>
                    }
                </>,
                copy: <div className="flex items-center justify-end" onClick={e => handleCopyBtnClick(item.url, item.reclaim)}>
                    <Tooltip title={`${(item.reclaim && item.amount != 0) ? 'Reclaim funds' : 'Copy URL to clipboard'}`}>
                        {
                            item.amount != 0 && <Button type={`${(item.reclaim && item.amount != 0) ? 'reclaim-btn' : 'primary'}`}>
                                {
                                    (item.reclaim && item.amount != 0) && <AiOutlineReload className="text-lg" />
                                    || <AiOutlineCopy className="text-lg" />
                                }
                            </Button>
                            || <Button type="primary" disabled>
                                <AiOutlineCopy className="text-lg" />
                            </Button>
                        }
                    </Tooltip>
                </div>
            })
        })
    }

    mapElement(history.get());

    // if (data.length > 0) {
    //     // mapElement(data);
    // } else {
    //     // mapElement(sampleData);
    // }

    const columns = [
        {
            title: null,
            dataIndex: 'sno',
            key: 'sno',
        },
        {
            title: null,
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: null,
            dataIndex: 'url',
            key: 'url',
        },
        {
            title: null,
            dataIndex: 'copy',
            key: 'copy',
        },
    ];
    return (
        <>
            <div className="my-3">
                <div className="box-shadow p-3 py-5 rounded-md ">
                    <Spin
                        spinning={history.get().length === 0}
                        tip="Loading..."
                    >
                        <div className="overflow-x-auto relative">
                            <Table
                                dataSource={dataSource}
                                columns={columns}
                                pagination={false}
                                showHeader={false}
                            />
                        </div>
                    </Spin>
                </div>
            </div>
        </>
    )
}

export default CompanyHistoryCard;