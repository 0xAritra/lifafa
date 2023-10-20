import Aos from "aos";
import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight, AiOutlineFieldTime } from "react-icons/ai";
import { GlobalContext } from "../contexts/globalContext";
import { DatePicker, TimePicker, ConfigProvider, theme, Modal, Spin, QRCode } from "antd";
import dayjs from "dayjs";
import CompanyHistoryCard from "../components/history";
import 'aos/dist/aos.css';

const CreateLink = () => {
    const isMounted = useRef(false);
    const [funds, setFunds] = useState(null);
    const [secondsTimeLimit, setSecondsTimeLimit] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);
    const [timeLimitDate, setTimeLimitDate] = useState(null);
    const [NFTSAddress, setNFTSAddress] = useState(null);
    const { notification, message } = useContext(GlobalContext);
    const [history, setHistory] = useState([]); // [{url: 'some url', amount: 1000}]
    const [historyLoading, setHistoryLoading] = useState(true);
    const yesterday = dayjs().subtract(1, 'day').endOf('day');
    const [share_url, setShare_url] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aos.init();
            loadPageData();
        }
    }, [])

    const backendRequest = async (data = {}) => {
        return new Promise((resolve, reject) => { // {status: '<success || any error message>', link: '<url>'}
            setTimeout(() => {
                resolve({
                    status: 'success',
                    link: window.location.protocol + '//' + window.location.hostname + '/redeem/' + 'some_id'
                })
            }, 2000)
        })
    }

    const backend_fetchHistory = async () => {
        return new Promise((resolve, reject) => { // {status: '<success || any error message>', link: '<url>'}
            setTimeout(() => {
                resolve({
                    status: 'success',
                    data: [{
                        url: 'https://www.google.com',
                        amount: 100,
                        reclaim: true
                    }]
                })
            }, 2000)
        })
    }

    function loadPageData() {
        setHistoryLoading(true);
        backend_fetchHistory().then(resp => {
            setHistory(resp.data);
            message.destroy();
            setHistoryLoading(false);
        })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        //validate form
        if (!funds || !NFTSAddress || !timeLimit || !timeLimitDate) {
            notification.error({
                message: 'Invalid form',
                description: 'Please fill all the fields',
            });
            return;
        }
        //validate funds
        if (isNaN(funds) || funds < 0) {
            notification.error({
                message: 'Invalid funds',
                description: 'Please enter a valid amount',
            });
            return;
        }

        //calculate seconds from the selected time and date from now
        var seconds = dayjs(timeLimitDate).diff(dayjs(), 'second');
        seconds += dayjs(timeLimit).diff(dayjs(), 'second');
        setSecondsTimeLimit(seconds);
        if (seconds < 0) {
            notification.error({
                message: 'Invalid time',
                description: 'Please select a valid time',
            });
            return;
        }

        Modal.confirm({
            title: 'Are you sure?',
            content: <>
                <p>Are you sure you want to create this link?</p>
                <p>Link will be valid for {seconds} seconds from now</p>
            </>,
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                //send request to backend
                message.loading('Generating link...', 30);
                var resp = await backendRequest({
                    funds: funds,
                    seconds: secondsTimeLimit,
                    NFTSAddress: NFTSAddress
                });
                message.destroy();
                if (resp.status !== 'success') {
                    notification.error({
                        message: 'Error',
                        description: resp.status,
                    });
                } else {
                    setShare_url(resp.link);
                    setIsModalOpen(true);
                }
            }
        });

    }
    const openSystemShareMenu = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Red Envelope',
                text: 'Red Envelope',
                url: share_url
            }).then(() => {
                message.success('Shared successfully');
            })
                .catch(err => {
                    notification.error({
                        message: 'Failed to share',
                        description: err,
                    });
                });
        } else {
            notification.error({
                message: 'Failed to share',
                description: 'Your browser does not support this feature',
            });
        }
    }
    const copytoclipboard = () => {
        navigator.clipboard.writeText(share_url).then(function () {
            message.success('Copied to clipboard');
        }, function (err) {
            notification.error({
                message: 'Failed to copy to clipboard',
                description: err,
            });
        });
    }
    return (
        <>
            <div className="font-[Montserrat] mx-6">
                <form className="flex gap-8 flex-col" onSubmit={handleFormSubmit}>
                    <div data-aos-delay={100} data-aos="fade-up" className="flex flex-col gap-2">
                        <label className="text-[#C9FF28] font-semibold text-sm uppercase">Enter funds to be added *</label>
                        <input type="number" value={funds} onChange={e => setFunds(e.target.value)} className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold" />
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
                                    onChange={e => setTimeLimitDate(e)}
                                    placeholder="Date"
                                    value={timeLimitDate}
                                    disabledDate={current => {
                                        return current && current < yesterday;
                                    }}
                                />
                                <div data-aos="fade-up" className="w-full">
                                    <TimePicker
                                        className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold"
                                        onChange={e => setTimeLimit(e)}
                                        placeholder="Time"
                                        format={'HH:mm: A'}
                                        value={timeLimit}
                                    />
                                </div>
                            </div>
                        </div>
                    </ConfigProvider>
                    <div data-aos-delay={300} data-aos="fade-up" className="flex flex-col gap-2">
                        <label className="text-[#C9FF28] font-semibold text-sm uppercase">NFTS address *</label>
                        <input value={NFTSAddress} onChange={e => setNFTSAddress(e.target.value)} className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold" />
                    </div>
                    <div className="my-4 flex ">
                        <button data-aos-delay={400} data-aos="fade-up" className="bg-[#c9ff28] rounded-sm flex gap-2 px-3 py-2 items-center font-semibold">Generate Link <AiOutlineArrowRight className="text-xl" /></button>
                    </div>
                </form>
                <div className="my-4">
                    <h1 data-aos-delay={500} data-aos="fade-up" className="text-white font-semibold flex items-center text-xl gap-1"><AiOutlineFieldTime className="text-2xl" /> HISTORY</h1>
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
                    onCancel={e => setIsModalOpen(false)}
                >
                    <div className="pt-4">
                        <div className="flex items-center justify-center flex-col h-full my-6">
                            <div id="qr-code">
                                <QRCode size={170} value={share_url} color="#c9ff28" bgColor="#0b0a0a" />
                            </div>
                            <p className="mx-8 font-semibold my-4">The link is generated and your red envelope is ready to be shared.</p>
                        </div>
                        <div className="grid grid-cols-2">
                            <div onClick={openSystemShareMenu} className="flex justify-center items-center bg-[#616f39] p-3 cursor-pointer text-white font-semibold">Share</div>
                            <div onClick={copytoclipboard} className="flex justify-center items-center bg-[#a7d129] p-3 cursor-pointer text-white font-semibold">Copy</div>
                        </div>
                    </div>
                </Modal>
            </ConfigProvider>
        </>
    )
}


export default CreateLink;