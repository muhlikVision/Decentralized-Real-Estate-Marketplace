const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lendor
    let realEstate, escrow

    beforeEach(async () => {
        [buyer, seller, inspector, lendor] = await ethers.getSigners()
        
        //deploy real estate
        const _realEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await _realEstate.deploy()
        //console.log(realEstate.address)
        
        //mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()
        
        //deploy escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lendor.address
        )

        //seller approves property
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        //list property
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    describe('Deployment', () => {

        it("NFT Addresses", async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it("Seller Addresses", async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it("Inspector Addresses", async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it("Lendor Addresses", async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lendor.address)
        })

    })

    describe('Listing', () => {
        it("Is listed on escrow", async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it("Update nft Ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })

        it("Returns Buyer", async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it("Returns Purchase Price", async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it("Returns Escrow Amount", async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Deposits', () => {
        it('Updates escrow contract balance', async() => {
            const transaction  = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)})
            await transaction.wait()
            const res = await escrow.getBalance()
            expect(res).to.be.equal(tokens(5))
        })
    })

    describe('Inspection', () => {
        it('Updates Inspection status', async() => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
            const res = await escrow.inspectionPassed(1)
            expect(res).to.be.equals(true)
        })
    })

    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lendor).approveSale(1)
            await transaction.wait()
        })
        
        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lendor.address)).to.be.equal(true)
        })
    })
})
