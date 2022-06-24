pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EYToken is ERC20 {
    address owner;
    constructor() public ERC20("CM CO2", "cMCO2") {
        _mint(msg.sender, 1000000000000000000000000);
        owner = msg.sender;
    }
    function _mintToGame(uint256 amount,address GameContract)
       public onlyOwner
   {
       _mint(address(GameContract), amount);
   }
     modifier onlyOwner
    {
        require(owner == msg.sender);
         _ ;
    }


}