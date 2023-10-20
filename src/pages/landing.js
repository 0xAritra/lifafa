import heroImg from '../assets/hero-img.png';
import { AiOutlineArrowRight } from "react-icons/ai";
import AOS from "aos";
import 'aos/dist/aos.css';
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
const LandingPage = () => {
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            AOS.init();
        }
    }, [])
    return (
        <>
            <div className="grid md:grid-cols-2 gap-y-20 md:gap-y-0">
                <div className="h-full flex gap-8 flex-col justify-center text-[Montserrat] order-2">
                    <div className="">
                        <h1 data-aos="fade-up" className="text-[#F8EEB4] uppercase text-5xl font-[Oswald] leading-normal tracking-widest">Create your Red <br /> Envelope</h1>
                        <p data-aos="fade-up" data-aos-delay={100} className="text-[#A7D129] my-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
                    </div>
                    <div>
                        <Link to={'/create-link'}>
                            <button data-aos-delay={200} data-aos="fade-up" className="bg-[#c9ff28] rounded-sm flex gap-2 px-3 py-2 items-center font-semibold">Create Now <AiOutlineArrowRight className="text-xl" /></button>
                        </Link>
                    </div>
                    <div className="my-20 md:my-0">&nbsp;</div>
                </div>
                <div className="flex items-center justify-center order-1 md:order-2">
                    <img data-aos="fade-left" data-aos-delay={100} src={heroImg} className="md:w-[60%] w-[75%] h-auto" />
                </div>
            </div>
        </>
    )
}

export default LandingPage;