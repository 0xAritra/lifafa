import { Popover } from "antd";
import { useState } from "react";
import { AiOutlineClose, AiOutlineMenu, AiOutlineProfile, AiOutlineUser } from "react-icons/ai";
import { Link } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const tmpAddress = "0xd156D3731EE08B5d07758686cD2De516F4AeCfDB";
    return (
        <div className="border-b-[#2d2c2c] border-b-[2px]">
            <div className="grid grid-cols-12 my-10 md:mx-16 mx-8 font-[Montserrat]">
                <div className="col-span-3 flex gap-12 items-center justify-between">
                    <h1 className="text-white text-xl font-[Inter]">
                        <Link to={'/'}>LOGO</Link>
                    </h1>
                    <Link to={'/redeem'}><span className="text-[#C9FF28] hidden md:block font-semibold uppercase">Redeem</span></Link>
                    <Link to={'/create-link'}><span className="text-[#C9FF28] hidden md:block font-semibold uppercase">Create</span></Link>
                </div>
                <div className="col-span-6"></div>
                <div className="col-span-3 flex items-center justify-end text-[#C9FF28] text-sm md:text-base">
                    <div className="flex items-center gap-2 font-semibold">
                        {/* LOGIN */}
                        <ConnectButton />
                        {/* {tmpAddress.slice(0, 6)}...{tmpAddress.slice(-4)} */}
                    </div>
                    <div className="p-2 rounded-md cursor-pointer ml-2 md:hidden">
                        <Popover
                            content={<div className="w-[250px]" onClick={e => setMenuOpen(false)}>
                                <div className="flex flex-col gap-3">
                                    <Link to={'/redeem'}><span className="text-[#C9FF28] font-semibold uppercase">Redeem</span></Link>
                                    <Link to={'/create-link'}><span className="text-[#C9FF28] font-semibold uppercase">Create</span></Link>
                                    <Link to={''}><span className="text-[#C9FF28] font-semibold uppercase">Login</span></Link>
                                    {/* <Link to={''}><span className="text-[#C9FF28] font-semibold uppercase">{tmpAddress.slice(0, 6)}...{tmpAddress.slice(-4)}</span></Link> */}
                                </div>
                            </div>}
                            open={isMenuOpen}
                            placement="bottomRight"
                        >
                            {
                                isMenuOpen && <AiOutlineClose onClick={e => setMenuOpen(false)} className="text-2xl text-[#C9FF28]" />
                                || <AiOutlineMenu onClick={e => setMenuOpen(true)} className="text-2xl text-[#C9FF28]" />
                            }
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar;