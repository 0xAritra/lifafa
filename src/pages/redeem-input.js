import Aos from "aos";
import 'aos/dist/aos.css';
import { useContext, useEffect, useRef, useState } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../contexts/globalContext";
import { readContract } from "@wagmi/core";
import { contract_abi, contract_address } from "../constants";

const RedeemLanding = () => {
    const isMounted = useRef(false);
    const [redeemId, setRedeemId] = useState(null);
    const navigate = useNavigate();
    const { message, notification } = useContext(GlobalContext);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            Aos.init();
        }
    }, [])

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        //validate redeemId
        if (!redeemId || redeemId === '') {
            message.error('Please enter a valid redeem id');
            return;
        }
        message.loading('Validating redeem id...', 30);
        var data = await readContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'isInvalidID',
            args: [redeemId]
        })
        message.destroy();
        if (data) {
            message.error('Invalid redeem id');
            return;
        }
        navigate(`/redeem/${redeemId}`);
    }
    return (
        <>
            <form onSubmit={handleFormSubmit}>
                <div data-aos-delay={100} data-aos="fade-up" className="flex flex-col gap-2">
                    <label className="text-[#C9FF28] font-semibold text-sm uppercase">Enter your redeem id *</label>
                    <input type="text" value={redeemId} onChange={e => setRedeemId(e.target.value)} className="bg-white px-2 py-3 rounded-md w-full focus:outline-none font-[Inter] font-semibold" />
                </div>
                <div className="my-4 flex ">
                    <button data-aos-delay={200} data-aos="fade-up" className="bg-[#c9ff28] rounded-sm flex gap-2 px-3 py-2 items-center font-semibold">Redeem <AiOutlineArrowRight className="text-xl" /></button>
                </div>
            </form>
        </>
    )
}

export default RedeemLanding;