//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {

    address public lender;
    address public inspector;
    address payable public seller;
    address public nftAddress;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;
    
    modifier onlyBuyer(uint256 _nft) {
        require(msg.sender == buyer[_nft], "Only Buyer can call this");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only Seller can call this");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only Inspector can call this");
        _;
    }

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //transfer the  nft from sellers wallet to escrow wallet
    function list (
        uint256 _nftId, 
        address _buyer, 
        uint256 _purchasePrice, 
        uint256 _escrowAmount
    ) public payable onlySeller {
        //Transfer the nft from seller to this address
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);
        //check if nft is listed on escrow
        isListed[_nftId] = true;

        purchasePrice[_nftId] = _purchasePrice; 
        escrowAmount[_nftId] = _escrowAmount;
        buyer[_nftId] = _buyer;
    }

    //buyer deposits to escrow contract
    function depositEarnest(uint256 _nftId) public payable onlyBuyer(_nftId) {
        require(msg.value >= escrowAmount[_nftId]);
    }

    //get current escrow balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //lets the contract recieve ether
    receive() external payable {}

    //update inspection status
    function updateInspectionStatus(uint256 _nftId, bool _passed)
        public
        onlyInspector
    {
        inspectionPassed[_nftId] = _passed;
    }

    // Approve the property nft Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    

}

