import { Button, Modal, Spin, Table, Tooltip } from "antd";
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { AiOutlineCopy, AiOutlineReload } from 'react-icons/ai';
import { FC } from 'react';

// interface CompanyHistoryCardProps {
//     data: {
//         url: string;
//         amount: number;
//         reclaim: Boolean;
//     }[];
//     flagRefresh: () => void;
// }
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

    const backendRequest = async (data = {}) => {
        return new Promise((resolve, reject) => { // {status: '<success || any error message>', link: '<url>'}
            setTimeout(() => {
                resolve({
                    status: 'success',
                })
            }, 2000)
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
                    var resp = await backendRequest({ url: url });
                    message.destroy();
                    if (resp.status === 'success') {
                        // flagRefresh();
                        history.set([]);
                        history.reload.set(true);
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
                url: <a href={item.url} className="hover:underline underline-white underline-offset-4 hover:text-white" target="_blank" rel="noopener noreferrer nofollow">{item.url}</a>,
                copy: <div className="flex items-center justify-end" onClick={e => handleCopyBtnClick(item.url, item.reclaim)}>
                    <Tooltip title={`${item.reclaim ? 'Reclaim funds' : 'Copy URL to clipboard'}`}>
                        <Button type="primary">
                            {
                                item.reclaim && <AiOutlineReload className="text-lg" />
                                || <AiOutlineCopy className="text-lg" />
                            }
                        </Button>
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