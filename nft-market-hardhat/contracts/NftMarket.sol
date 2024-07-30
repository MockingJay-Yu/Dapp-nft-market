// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract NftMarket is IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    IERC20 public immutable FUSDT;
    IERC721 public immutable NFTM;

    struct Product {
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    // EnumerableSet to store token Ids
    EnumerableSet.UintSet private tokenIds;
    // Mapping from token Id to product details
    mapping(uint256 => Product) public tokenIdToProduct;

    event addProduct(uint256 indexed tokenId, address indexed operator, address indexed seller, uint256 price);
    event removeProduct(uint256 indexed tokenId, address indexed seller, uint8 indexed reason);
    event modifiyPrice(uint256 indexed tokenId, uint256 previousPrice, uint256 crruentPrice);
    event sold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);

    modifier existsProduct(uint256 _tokenId) {
        if (tokenIdToProduct[_tokenId].seller == address(0)) {
            revert("TokenId is Not Exists");
        }
        _;
    }

    constructor(address _erc20, address _erc721) {
        require(_erc20 != address(0), "ERC20 contract address can not be zero");
        require(_erc721 != address(0), "ERC721 contract address can not be zero");
        FUSDT = IERC20(_erc20);
        NFTM = IERC721(_erc721);
    }

    function buy(uint256 _tokenId, uint256 _price) external existsProduct(_tokenId) {
        Product memory product = tokenIdToProduct[_tokenId];
        uint256 price = product.price;
        address seller = product.seller;

        require(_price == price, "Price is not equal");

        require(FUSDT.transferFrom(msg.sender, seller, price), "FUSDT transfer is fail");

        NFTM.safeTransferFrom(address(this), msg.sender, product.tokenId);

        _removeProduct(_tokenId, 1);
        emit sold(_tokenId, msg.sender, seller, price);
    }

    function cancelProduct(uint256 _tokenId) external existsProduct(_tokenId) {
        require(tokenIdToProduct[_tokenId].seller == msg.sender, "You are not seller");
        _removeProduct(_tokenId, 0);
    }

    function changePrice(uint256 _tokenId, uint256 _price) external existsProduct(_tokenId) {
        require(_price > 0, "Price can not be zero");
        Product storage product = tokenIdToProduct[_tokenId];
        require(product.seller == msg.sender, "You are not seller");
        uint256 previousPrice = product.price;
        product.price = _price;
        emit modifiyPrice(_tokenId, previousPrice, _price);
    }

    function getAllTokenId() external view returns (uint256[] memory) {
        return tokenIds.values();
    }

    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data)
        external
        returns (bytes4)
    {
        require(_operator == address(NFTM), "Only the ERC721 contract can call this function");
        uint256 _price = toUint256(_data, 0);
        require(_price > 0, "Price can not be zero");

        tokenIdToProduct[_tokenId].tokenId = _tokenId;
        tokenIdToProduct[_tokenId].price = _price;
        tokenIdToProduct[_tokenId].seller = _from;

        tokenIds.add(_tokenId);

        emit addProduct(_tokenId, _operator, _from, _price);
        return MAGIC_ON_ERC721_RECEIVED;
    }

    function _removeProduct(uint256 _tokenId, uint8 reason) internal existsProduct(_tokenId) {
        delete tokenIdToProduct[_tokenId];
        tokenIds.remove(_tokenId);
        emit removeProduct(_tokenId, msg.sender, reason);
    }

    function toUint256(bytes memory _bytes, uint256 _start) private pure returns (uint256) {
        require(_start + 32 >= _start, "Market: toUint256_overflow");
        require(_bytes.length >= _start + 32, "Market: toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }
        return tempUint;
    }
}
