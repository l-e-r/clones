import React from 'react'
import Link from 'next/link';
import Image from 'next/image';

import { 
    useAddress, 
    useDisconnect,
    useMetamask
} from "@thirdweb-dev/react";

import {useTheme} from 'next-themes'

import { 
    BellIcon,
    ShoppingCartIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    SunIcon
} from "@heroicons/react/24/outline";

import logo from '../assets/images/threebayLogo.png';
import WalletMessage from './WalletMessage';


type Props = {}

const Header = (props: Props) => {
    const connectWithMetamask = useMetamask();
    const disconnect = useDisconnect();
    const address = useAddress();
    const {theme, setTheme} = useTheme()

    return (
    <div className="max-w-6xl mx-auto p-2">
        <nav className="flex justify-between">
            <div className="flex items-center space-x-2 text-sm">
                {address 
                    ? (
                        <button onClick={disconnect} className="connectWalletButton">Hi, {address.slice(0,4) + "..." + address.slice(-4)}</button>
                    )
                    : (
                        <button onClick={connectWithMetamask} className="connectWalletButton">Connect your wallet</button>
                    )
                }  

                <p className="headerLink">Daily Deals</p>
                <p className="headerLink">Help & Contact</p>

            </div>

            <div className="flex items-center space-x-2 text-sm">
                 <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? ( <MoonIcon className="h-6 w-6"/> ) : ( <SunIcon className="h-6 w-6"/> )}
                </button>
            </div>

            <div className="flex items-center space-x-4 text-sm">
                <p className="headerLink">Ship to</p>
                <p className="headerLink">Sell</p>
                <p className="headerLink">Watchlist</p>

                <Link href="/addItem" className="flex items-center hover:link">
                    Add to inventory
                    <ChevronDownIcon className="h-4" />
                </Link>

                <BellIcon className="h-6 w-6" />
                <ShoppingCartIcon className="h-6 w-6" />
            </div>
        </nav>

        <hr className="mt-2" />
        {!address ? <WalletMessage /> : null}

        <section className="flex items-center space-x-2 py-5">
            <div className="h-16 w-16 sm:w-28 md:w-44 cursor-pointer flex-shrink-0">
                <Link href="/">
                    <Image
                        className="h-full w-full object-contain" 
                        alt="threebay logo"
                        src={logo}
                        width={100}
                        height={100}
                    />
                </Link>
            </div>

            <button className="hidden lg:flex items-center space-x-2 w-20">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Shop by Category</p>
                <ChevronDownIcon className="h-4 flex-shrink-0" />
            </button>

            <div className="flex items-center space-x-2 px-2 md:px-5 md:py-2 border-black dark:border-gray-400 border-2 dark:border-1 flex-1">
                <MagnifyingGlassIcon className="w-5 text-gray-400 dark:text-gray-300" />
                <input className="flex-1 outline-none bg-transparent" placeholder="Search for Anything" type="text" />
            </div>

            <button className="hidden sm:inline bg-blue-600 text-white px-5 py-2 md:px-10 border-2 border-blue-600">Search</button>

            <Link href="/listItem">
                <button className="border-2 border-blue-600 px-5 py-2 md:px-10 text-blue-600 hover:bg-blue-600/50 hover:text-white cursor-pointer">List Item</button>
            </Link>
        </section>

        <hr />

        <section className="flex py-3 space-x-6 text-xs md: text-sm whitespace-nowrap justify-center px-6">
            <p className="link">Home</p>
            <p className="link">Electronics</p>
            <p className="link">Computers</p>
            <p className="link hidden sm:inline">Video Games</p>
            <p className="link hidden sm:inline">Home & Garden</p>
            <p className="link hidden md:inline">Health & Beauty</p>
            <p className="link hidden lg:inline">Collectibles and Art</p>
            <p className="link hidden lg:inline">Books</p>
            <p className="link hidden lg:inline">Music</p>
            <p className="link hidden xl:inline">Deals</p>
            <p className="link hidden xl:inline">Other</p>
            <p className="link">More</p>
        </section>
    </div>
    )
}

export default Header