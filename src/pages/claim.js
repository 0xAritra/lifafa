import { Button } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import '../css-addons/envelope.css'
import 'animate.css'
import { GlobalContext } from "../contexts/globalContext";
import ConfettiExplosion from 'react-confetti-explosion';
import { useNavigate, useParams } from "react-router-dom";
import { FrownOutlined } from '@ant-design/icons';
import Aos from "aos";
import 'aos/dist/aos.css';

const ClaimReward = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isClaimed = useRef(false);
    const isMounted = useRef(false);
    const { message, notification } = useContext(GlobalContext);
    const [isCardOpen, setCardOpen] = useState(false)
    const [isAmountVisible, setisAmountVisible] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [isExploding, setIsExploding] = useState(false);
    const [amount, setAmount] = useState(false);
    const [status, setStatus] = useState(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aos.init();
            if (!id || id === '') {
                notification.error({
                    message: 'Invalid URL',
                    description: 'Please check the URL and try again',
                });
                navigate('/');
                return;
            }
        }
    }, [])

    const blockchainProcess = async (id) => {
        return new Promise((resolve, reject) => { // {status: '<success || any error message>', amount: '$<int>'}
            //backend call
            setTimeout(() => {
                resolve({
                    status: 'success',
                    amount: '$100'
                });
            }, 2000);
        })
    }

    const handleEnvelopeClick = async () => {
        if (processing) return;
        if (isClaimed.current) return;
        setProcessing(true);
        message.loading('Processing request...', 30);

        //sending request to blockchain
        var resp = await blockchainProcess(id);

        message.destroy();
        setProcessing(false);
        isClaimed.current = true;
        setCardOpen(true);

        //validate response
        setStatus(resp.status);
        if (resp.status == 'success') {
            setTimeout(() => {
                setAmount(resp.amount);
                setisAmountVisible(true);
                setTimeout(() => {
                    setIsExploding(true);
                }, 400)
            }, 800);
        }
    }


    return (
        <>
            <h1 data-aos-delay={1000} data-aos="fade-down" className="text-[#fff] text-center font-semibold">
                You recieved an Gift. Click on the Envelope to open it.
            </h1>
            <div className="flex flex-col gap-2 h-[80dvh] items-center justify-center">
                <div className={`${processing ? 'animate-pulse cursor-not-allowed' : ''}`}>
                    <div onClick={handleEnvelopeClick} className={`envelope animate__animated animate__fadeInDownBig relative cursor-pointer ${isCardOpen ? 'card-open' : ''}`}>
                        <div className="back relative w-[250px] h-[200px] bg-[#e50530]"></div>
                        <div className="letter absolute bg-white box-shadow w-[230px] h-[180px] top-[10px] left-[10px] transition delay-300">
                            {
                                (isCardOpen && status == 'success') && <>
                                    <div className="text-center text-2xl mt-[20px] font-bold animate__animated animate__fadeInUp">You've won</div>
                                    {
                                        isAmountVisible && <div className="text-center text-xl font-semibold animate__animated animate__fadeInUp">
                                            <div className="flex gap-1 w-full items-center justify-center">
                                                <span className="text-xl">🎉</span>
                                                <span>{amount}</span>
                                                {isExploding && <ConfettiExplosion
                                                    force={0.8}
                                                    duration={3000}
                                                    particleCount={250}
                                                    width={window.innerWidth}
                                                    height={document.documentElement.scrollHeight}
                                                />}
                                                <span className="text-xl">🎉</span>
                                            </div>
                                        </div>
                                    }
                                </>
                                || <>
                                    <div className="flex justify-center text-2xl mt-[20px] font-bold animate__animated animate__fadeInUp"><FrownOutlined className="text-6xl" /></div>
                                    <div className="text-center text-[#C9FF28] text-lg mt-[20px] font-bold animate__animated animate__fadeInUp">Error</div>
                                </>
                            }
                        </div>
                        <div className="front"></div>
                        <div className="top"></div>
                        <div className="shadow"></div>
                    </div>
                </div>
                {
                    status != 'success' && <div className="text-center text-2xl mt-[20px] font-bold animate__animated animate__fadeInUp">{status}</div>
                }
            </div>
        </>
    )
}

export default ClaimReward;