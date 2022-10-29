import {
  useActiveListings,
  useContract,
  MediaRenderer
} from "@thirdweb-dev/react";

import { motion } from "framer-motion";
import { ListingType } from "@thirdweb-dev/sdk";
import { BanknotesIcon, ClockIcon } from "@heroicons/react/24/outline";

import Header from '../components/Header'

const Home = () => {
  const { contract } = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT, 'marketplace');
  const { data: listings, isLoading: loadingListings} = useActiveListings(contract);
    
  return (
    <div className="">
      <Header />

      <main className="max-w-6xl mx-auto py-2 px-6">
        {loadingListings
          ? (
            <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto">
              {[1,2,3,4].map((item) => (
              <div key={item} className="lex flex-col dummy-card space-y-5 rounded-2xl bg-white/5 dark:bg-black/25 p-4 relative 
                before:absolute before:inset-0
                before:-translate-x-full
                before:animate-[shimmer_2s_infinite]
                before:bg-gradient-to-r
                before:from-transparent before:via-gray-500/20 before:to-transparent
                isolate
                overflow-hidden
                shadow-xl shadow-black/5
                before:border-t before:border-rose-100/10
                opacity-50
              ">
                <div className="h-24 rounded-lg bg-gray-300"></div>
                <div className="space-y-3">
                  <div className="h-3 w-3/5 rounded-lg bg-gray-400"></div>
                  <div className="h-3 w-4/5 rounded-lg bg-gray-300"></div>
                  <div className="h-3 w-1/5 rounded-lg bg-gray-400"></div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <motion.div 
              variants={{
                hidden: {
                  opacity: 0,
                },
                show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.6,
                      delayChildren: 0.3,
                    },
                }
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto">
              {listings?.map(listing => (
                <motion.div
                  key={listing.id}
                  variants={{
                    hidden: {
                      scale: 0,
                      opacity: 0
                    },
                    show: { 
                      scale: 1,
                      opacity: 1,
                      transition: {
                        duration: 0.3
                      }
                    }
                  }}
                  className="flex flex-col card hover:scale-105 transition-all duration-150 ease-out">
                  <div className="flex flex-1 flex-col pb-2 items-center justify-center">
                    <MediaRenderer className="w-44 max-h-25"src={listing.asset.image} />
                  </div>
                  <div className="pt-2 space-y-4">
                    <div>
                      <h2 className="truncate text-lg">{listing.asset.name}</h2>
                      <hr />
                      <p className="truncate text-sm text-gray-600 dark:text-gray-400 mt-2">{listing.asset.description}</p>
                    </div>
                  </div>
                  <p className="py-4">
                    <span className="font-bold mr-1">
                      {listing.buyoutCurrencyValuePerToken.displayValue}
                    </span>
                    {listing.buyoutCurrencyValuePerToken.symbol}
                  </p>
                  <div className={`flex items-center space-x-1 justify-end text-xs border w-fit ml-auto p-2 rounded-lg text-white ${listing.type === ListingType.Direct ? "bg-blue-500" : "bg-red-500"}`}>
                    <p>
                      {listing.type === ListingType.Direct ? "Buy Now" : "Auction"}
                    </p>
                    {listing.type === ListingType.Direct 
                        ? (
                          <BanknotesIcon className="h-4" />
                        ) : (
                          <ClockIcon className="h-4" />
                        )
                      }
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        }
      </main>
    </div>
  )
}

export default Home
