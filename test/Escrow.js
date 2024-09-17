const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    it("saves the nft addresses", async () => {
        const signers = await ethers.getSigners()
        console.log(signers.length);

        //deploy real estate
        const _realEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await _realEstate.deploy()
        console.log(realEstate.address)
        
        //mint

        //let transaction = await realEstate.mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")

    })
})
