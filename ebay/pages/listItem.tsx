import React, { FormEvent, useState } from 'react'
import Header from '../components/Header'

import { 
    useAddress,
    useContract,
    MediaRenderer,
    useNetwork,
    useNetworkMismatch,
    useOwnedNFTs,
    useCreateAuctionListing,
    useCreateDirectListing
} from '@thirdweb-dev/react';

import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from '@thirdweb-dev/sdk';
import network from '../utils/network';
import { useRouter } from 'next/router';

type Props = {}

const listItem = (props: Props) => {
    const router = useRouter();
    const address = useAddress();
    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        "marketplace"
    );

    const { contract: collectionContract } = useContract(
        process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
        "nft-collection"
    );

    const ownedNFTs = useOwnedNFTs(collectionContract, address);
    const [selectedNFT, setSelectedNFT] = useState<NFT>();

    const networkMismatch = useNetworkMismatch();
    const [, switchNetwork] = useNetwork();

    const { mutate: createDirectListing, isLoading: loadingCreateDirectListing, error: errorCreateDirecListing } = useCreateDirectListing(contract);
    const { mutate: createAuctionListing, isLoading: loadingCreateAuctionListing, error: errorCreateAuctionListing } = useCreateAuctionListing(contract);

    const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (networkMismatch) {
            switchNetwork && switchNetwork(network);
            return;
        }

        if (!selectedNFT) { return; }

        const target = e.target as typeof e.target & {
            elements: { listingType: {value: string }, price: {value: string} }
        };

        const {listingType, price} = target.elements;

        if (listingType.value === "direct") {
            createDirectListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNFT.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
                quantity: 1, // TODO: make part of the form
                buyoutPricePerToken: price.value,
                startTimestamp: new Date()
            }, {
                onSuccess(data, variables, context) {
                    console.log("SUCCESS: ", data, variables, context);
                    router.push('/');
                },
                onError(error, variables, context) {
                    console.log("ERROR: ", error, variables, context);
                }
            })
        }

        if (listingType.value === "auction") {
            createAuctionListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNFT.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week TODO: add to form
                quantity: 1, // TODO: make part of the form
                buyoutPricePerToken: price.value,
                startTimestamp: new Date(),
                reservePricePerToken: 0 // TODO: make part of the form
            }, {
                onSuccess(data, variables, context) {
                    console.log("SUCCESS: ", data, variables, context);
                    router.push('/');
                },
                onError(error, variables, context) {
                    console.log("ERROR: ", error, variables, context);
                }
            })
        }
    };

  return (
    <div>
        <Header />

        <main className="max-w-6xl mx-auto p-10 pt-2">
            <h1 className="text-4xl font-bold">List an Item</h1>
            <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

            <hr className="mb-5" />

            <p>Below you will find the NFT's you own in your wallet</p>

            <div className="flex overflow-x-scroll space-x-2 p-4">
                {ownedNFTs?.data?.map(nft => (
                    <div key={nft.metadata.id} onClick={() => nft.metadata.id !== selectedNFT?.metadata.id && setSelectedNFT(nft)} 
                        className={`flex flex-col flex-1 space-y-2 card min-w-fit border-1 bg-gray-100 transition-opacity ease-in-out duration-300 
                        ${selectedNFT ? (nft.metadata.id === selectedNFT?.metadata.id ? 'opacity-100 border-pink-500 dark:border-pink-500 cursor-default hover:': 'opacity-25 hover:opacity-100') : ''}`}
                    >
                        <div className="flex flex-1 flex-col pb-2 items-center justify-center">
                            <MediaRenderer className="w-44 max-h-25" src={nft.metadata.image} />
                        </div>
                        <div className="pt-2 space-y-4">
                            <div>
                                <p className="truncate text-lg font-bold">{nft.metadata.name}</p>
                                <hr />
                                <p className="truncate text-xs text-gray-600 dark:text-gray-400 mt-2">{nft.metadata.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedNFT && (
                <form onSubmit={handleCreateListing}>
                    <div className="flex flex-col p-10">
                        <div className="grid grid-cols-2 gap-5">
                            <label className="border-r font-light">Direct Listing / Fixed Price</label>
                            <input type="radio" name="listingType" value="direct" className="ml-auto h-10 w-10" />

                            <label className="border-r font-light">Auction</label>
                            <input type="radio" name="listingType" value="auction" className="ml-auto h-10 w-10"/>

                            <label className="border-r font-light">Price</label>
                            <input type="text" name="price" placeholder="0.05" className="bg-gray-100 p-5 dark:bg-gray-600 outline-none" />
                        </div>

                        <button type="submit" className="bg-blue-600 text-white rounded-lg p-4 mt-8">Create Listing</button>
                    </div>
                </form>
            )}
        </main>
    </div>
  )
}

export default listItem