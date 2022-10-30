import { UserCircleIcon } from '@heroicons/react/24/solid';

import toast from 'react-hot-toast';

import { 
    useContract,
    useNetwork,
    useNetworkMismatch,
    useMakeBid,
    useOffers,
    useMakeOffer,
    useBuyNow,
    useAddress,
    useListing,
    MediaRenderer,
    useAcceptDirectListingOffer
} from '@thirdweb-dev/react';

import { ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header';
import Countdown from 'react-countdown';
import network from '../../utils/network';
import { ethers } from 'ethers';
type Props = {}

const ListingPage = ({}: Props) => {
    const router = useRouter();
    const { listingId } = router.query as { listingId: string };
    const [ minimumNextBid, setMinimumNextBid ] = useState<{
        displayValue: string,
        symbol: string
    }>()
    const [ bidAmount, setBidAmount ] = useState("");

    const [, switchNetwork] = useNetwork();
    const networkMismatch = useNetworkMismatch();


    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        'marketplace'
    );

    const { mutate: buyNow } = useBuyNow(contract);
    const { mutate: makeOffer } = useMakeOffer(contract);
    const { mutate: makeBid } = useMakeBid(contract);
    const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract);
    const { data: offers} = useOffers(contract, listingId)
    const address = useAddress();

    const { data: listing, isLoading, error } = useListing(contract, listingId); 


    useEffect(() => {
        if (!listing || !listingId || !contract) return;

        if (listing.type === ListingType.Auction) {
            fetchMinimumNextBid();
        }
    }, [listing, listingId, contract])

    const fetchMinimumNextBid = async () => {
        if (!listingId || !contract) return;

        const {displayValue, symbol} = await contract.auction.getMinimumNextBid(listingId);

        setMinimumNextBid({
            displayValue: displayValue,
            symbol: symbol
        })
    }

    const formatPlaceholder = () => {
        if (!listing) return;

        if (listing.type === ListingType.Direct) {
            return "Enter Offer Amount";
        }

        if (listing.type === ListingType.Auction) {
            return Number(minimumNextBid?.displayValue) === 0
                ? "Enter Bid Amount"
                : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`
            // TODO: improve bid amount
        }
    }

    const buyNFT = async () => {
        if (networkMismatch) {
            switchNetwork && switchNetwork(network);
            return;
        }

        if (!listingId || !contract || !listing) return;

        toast.loading(`Buying ${listing.asset?.name ? listing.asset.name : 'item'}`);

        await buyNow({
            id: listingId,
            buyAmount: 1,
            type: listing.type
        }, {
            onSuccess(data, variables, context) {
                toast.dismiss();
                toast.success(`${listing.asset?.name ? listing.asset.name : 'item'} bought successfully!`);
                console.log("SUCCESS", data);
                router.replace('/');

            },
            onError(error, variables, context) {
                toast.dismiss();
                toast.error(`An error occured, attempting to buy ${listing.asset?.name ? listing.asset.name : 'item'}`);
                console.log("ERROR", error);
            }

        })

    }

    const createBidOrOffer = async () => {
       try {
        if (networkMismatch) {
            switchNetwork && switchNetwork(network);
            return;
        }

        // Direct Listing
        if (listing?.type === ListingType.Direct) {
            if (listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
                buyNFT();
                return;
            }

            toast.loading(`Making an offer for ${listing.asset?.name ? listing.asset.name : 'item'}`);
            await makeOffer({
                    quantity: 1,
                    listingId,
                    pricePerToken: bidAmount
                }, {
                    onSuccess(data, variables, context) {
                        toast.dismiss();
                        toast.success(`Offer for ${listing.asset?.name ? listing.asset.name : 'item'} submitted successfully!`);
                        console.log("SUCCESS", data, variables, context);
                        setBidAmount("");
                    },
                    onError(error, variables, context) {
                        toast.dismiss();
                        toast.error(`An error occured submitting an offer for ${listing.asset?.name ? listing.asset.name : 'item'}`);
                        console.log("ERROR", error, variables, context);
                    }
                }

            )
        }


        // Auction Listing
        if (listing?.type === ListingType.Auction) {
           toast.loading(`Placing a bid on ${listing.asset?.name ? listing.asset.name : 'item'}`);
            await makeBid({
                    listingId,
                    bid: bidAmount
                }, {
                    onSuccess(data, variables, context) {
                        toast.dismiss();
                        toast.success(`Bid submitted for ${listing.asset?.name ? listing.asset.name : 'item'} successfully`);
                        console.log("SUCCESS", data, variables, context);
                        setBidAmount("");
                    },
                    onError(error, variables, context) {
                        toast.dismiss();
                        toast.error(`An error occured submitting a bid for ${listing.asset?.name ? listing.asset.name : 'item'}`);
                        console.log("ERROR", error, variables, context);
                    }
                }
            
            )
        }


       } catch (error) {
            console.log(error);
       }
    }

  return (
    <div>
        <Header />
        {isLoading
        ? 
            <div className="text-center animate-pulse text-blue-500">
                <p>
                    Loading Item...
                </p>
            </div>
        :
            !listing 
            ?
                <div className="text-center">
                    <p>
                        Listing not found!
                    </p>
                </div>
            :
                <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
                    <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
                        <MediaRenderer src={listing?.asset.image} />
                    </div>

                    <section className="flex-1 apace-y-5 pb-20 lg:pb-0">
                        <div className="space-y-1"> 
                            <h1 className="text-xl font-bold">{listing.asset.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{listing.asset.description}</p>
                            <p className="flex items-center text-xs sm:text-base">
                                <UserCircleIcon className="h-5" />
                                <span className="font-bold pr-1">Seller: </span>
                                {listing.sellerAddress}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 items-center py-2"> 
                            <p className="font-bold">Listing Type:</p>
                            <p>{listing.type === ListingType.Direct 
                                ? "Direct Listing"
                                : "Auction Listing"}
                            </p>

                            <p className="font-bold">Buy Now Price:</p>
                            <p className="text-xl">
                                {listing.buyoutCurrencyValuePerToken.displayValue}
                                {" "}
                                <span className="font-semibold"> 
                                    {listing.buyoutCurrencyValuePerToken.symbol}
                                </span>
                            </p>
                            <button onClick={buyNFT} className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
                                Buy Now
                            </button>
                        </div>

                        {/* If DIRECT, show offers here... */}
                        {listing.type === ListingType.Direct && offers && (
                            <div className="grid grid-cols-2 space-y-2 gap-y-2">
                                <p className="font-bold">Offers:</p>
                                <p className="font-semibold">{offers.length > 0 ? offers.length : 0}</p>

                                {offers.map(offer => (
                                    <>
                                        <p className="flex items-center ml-5 text-sm italic">
                                            <UserCircleIcon className="h-3 mr-2" />
                                            {`${offer.offerer.slice(0,5)}...${offer.offerer.slize(-5)}`}
                                        </p>
                                        <div>
                                            <p 
                                                key={
                                                    offer.listingId + 
                                                    offer.offerer +
                                                    offer.totalOfferAmount.toString()
                                                }
                                                className="text-sm italic"
                                            >
                                                {ethers.utils.formatEther(offer.totalOfferAmount)}
                                                {" "}
                                                {NATIVE_TOKENS[network].symbol}
                                           </p>

                                            {listing.sellerAddress === address && (
                                                <button
                                                    onClick={() => {
                                                        toast.loading(`Accepting offer from ${offer.offerer.slice(0,5)}...${offer.offerer.slize(-5)}`)
                                                        acceptOffer({
                                                            listingId,
                                                            addressOfOfferor: offer.offerer
                                                        }, {
                                                            onSuccess(data, variables, context) {
                                                                toast.dismiss();
                                                                toast.success("Offer accepted successfully!");
                                                                console.log("SUCCESS", data, variables, context);
                                                                router.replace("/");
                                                            }
                                                        });
                                                    }}
                                                    className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                                                >
                                                    Accept Offer
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 space-y-2 items-center justify-end">
                            <hr className="col-span-2"/>

                            <p className="col-span-2 font-bold">
                                {listing.type === ListingType.Direct 
                                ? "Make an Offer" 
                                : "Place a Bid"}
                            </p>

                            {/* Remaining time on auction goes here...  */}
                            {listing.type === ListingType.Auction && (
                                <>
                                    <p>Current Minimum Bid:</p>
                                    <p className="text-xl">
                                        {minimumNextBid?.displayValue}
                                        {" "}
                                        <span className="font-semibold"> 
                                            {minimumNextBid?.symbol}
                                        </span>
                                    </p>

                                    <p>Time Remaining:</p>
                                    <Countdown
                                        className="text-xl font-semibold animate-pulse"
                                        date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                                    />
                                </>
                            )}

                            <input
                                className="border p-2 rounded-lg mr-5"
                                type="text"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder={formatPlaceholder()}
                            />
                            <button onClick={createBidOrOffer} className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10">
                                {listing.type === ListingType.Direct 
                                    ? "Offer"
                                    : "Bid"}
                            </button>
                        </div>
                    </section>
                </main>
        }
    </div>
  )
}

export default ListingPage