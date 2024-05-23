// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FUSDT is ERC20 {
    constructor() ERC20("fake USDT in market", "FUSDT") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }
}
