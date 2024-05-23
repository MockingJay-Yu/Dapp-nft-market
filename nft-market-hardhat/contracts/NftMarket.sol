// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

contract NftMarket is IERC721Receiver {
    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    ERC20 public FUSDT;
    ERC721 public NFTM;

    struct Product {
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    mapping(uint256 => Product) public tokenIdToProduct;

    Product[] public products;

    mapping(uint256 => uint256) public indexInProducts; //The position of product in the array

    event addProduct(
        uint tokenId,
        address operator,
        address seller,
        uint price
    );
    event removeProduct(uint tokenId, address seller);
    event modifiyPrice(
        uint tokenId,
        uint256 previousPrice,
        uint256 crruentPrice
    );
    event deal(uint tokenId, address buyer, address seller, uint256 price);

    modifier existsProduct(uint _tokenId) {
        if (tokenIdToProduct[_tokenId].seller == address(0)) {
            revert("TokenId is Not Exists");
        }
        _;
    }

    constructor(address _erc20, address _erc721) {
        require(_erc20 != address(0), "ERC20 contract address can not be zero");
        require(
            _erc721 != address(0),
            "ERC721 contract address can not be zero"
        );
        FUSDT = ERC20(_erc20);
        NFTM = ERC721(_erc721);
    }

    function buy(
        uint256 _tokenId,
        uint256 _price
    ) external existsProduct(_tokenId) {
        Product memory product = tokenIdToProduct[_tokenId];
        uint price = product.price;
        address seller = product.seller;

        require(_price == price, "Price is not equal");

        require(
            FUSDT.transferFrom(msg.sender, seller, price),
            "FUSDT transfer is fail"
        );

        NFTM.safeTransferFrom(address(this), msg.sender, product.tokenId);

        _removeProduct(_tokenId);
        emit deal(_tokenId, msg.sender, seller, price);
    }

    function cancelProduct(uint256 _tokenId) external existsProduct(_tokenId) {
        require(
            tokenIdToProduct[_tokenId].seller == msg.sender,
            "You are not seller"
        );
        _removeProduct(_tokenId);

        emit removeProduct(_tokenId, msg.sender);
    }

    function changePrice(
        uint256 _tokenId,
        uint256 _price
    ) external existsProduct(_tokenId) {
        require(_price > 0, "Price can not be zero");
        Product storage product = tokenIdToProduct[_tokenId];
        require(product.seller == msg.sender, "You are not seller");
        uint previousPrice = product.price;
        product.price = _price;

        products[indexInProducts[_tokenId]].price = _price;

        emit modifiyPrice(_tokenId, previousPrice, _price);
    }

    function _removeProduct(uint256 _tokenId) internal existsProduct(_tokenId) {
        delete tokenIdToProduct[_tokenId];

        uint256 removeIndex = indexInProducts[_tokenId];
        Product memory product = products[products.length - 1];
        indexInProducts[product.tokenId] = removeIndex;
        products[removeIndex] = product;
        products.pop();
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external returns (bytes4) {
        require(
            msg.sender == address(NFTM),
            "Only the ERC721 contract can call this function"
        );
        uint256 _price = toUint256(_data, 0);
        require(_price > 0, "Price can not be zero");

        tokenIdToProduct[_tokenId].tokenId = _tokenId;
        tokenIdToProduct[_tokenId].price = _price;
        tokenIdToProduct[_tokenId].seller = _from;

        products.push(tokenIdToProduct[_tokenId]);
        indexInProducts[_tokenId] = products.length - 1;

        emit addProduct(_tokenId, _operator, _from, _price);
        return MAGIC_ON_ERC721_RECEIVED;
    }

    function toUint256(
        bytes memory _bytes,
        uint256 _start
    ) public pure returns (uint256) {
        require(_start + 32 >= _start, "Market: toUint256_overflow");
        require(_bytes.length >= _start + 32, "Market: toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }
}
