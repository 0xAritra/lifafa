import { Button, Table, Tooltip } from "antd";
import { useContext } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { AiOutlineCopy } from 'react-icons/ai';
import { FC } from 'react';

interface CompanyHistoryCardProps {
    data: {
        title: string;
        url: string;
        amount: number;
    }[];
}
const CompanyHistoryCard: FC<CompanyHistoryCardProps> = ({ data = [] }) => {
    const { message, notification } = useContext(GlobalContext);
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
    const sampleData = [
        {
            title: 'Sample data',
            url: 'https://www.google.com',
            amount: 1000
        }
    ];

    const dataSource = [];

    const mapElement = (data) => {
        data.map((item, index) => {
            dataSource.push({
                sno: index + 1 + ')',
                title: <div className="flex flex-col gap-1">
                    <h1 className="">{item.title}</h1>
                    <p className="text-gray-500 text-sm"><b>Amount Added: </b>${item.amount}</p>
                </div>,
                url: <a href={item.url} target="_blank" rel="noopener noreferrer nofollow">{item.url}</a>,
                copy: <div onClick={e => copytoclipboard(item.url)}>
                    <Tooltip title="Copy URL to clipboard">
                        <Button type="primary">
                            <AiOutlineCopy />
                        </Button>
                    </Tooltip>
                </div>
            })
        })
    }

    if (data.length > 0) {
        mapElement(data);
    } else {
        mapElement(sampleData);
    }

    const columns = [
        {
            title: null,
            dataIndex: 'sno',
            key: 'sno',
        },
        {
            title: null,
            dataIndex: 'title',
            key: 'title',
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
            <div className="m-20">
                <h1 className="text-2xl uppercase text-blue-500 font-bold" >History</h1>
                <div className="my-3">
                    <div className="bg-white box-shadow p-3 py-5 rounded-md ">
                        <div className="overflow-x-auto relative">
                            <Table
                                dataSource={dataSource}
                                columns={columns}
                                pagination={false}
                                showHeader={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CompanyHistoryCard;