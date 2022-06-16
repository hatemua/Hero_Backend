pragma solidity ^0.8.3;
import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceRouter.sol";
import "witnet-solidity-bridge/contracts/interfaces/IWitnetPriceFeed.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DepositOracle {
    IWitnetPriceRouter public witnetPriceRouter;
    IWitnetPriceFeed public celoEurPrice;
    IWitnetPriceFeed public celoUsdPrice;
    IWitnetPriceFeed public EthUsdPrice;

    struct deposit {
        uint256 id;
        int256 totalDepositsValue;
        uint256 totalDepositTimes;
        address userWallet;
    }
    struct ativistBank {
        uint256 celoCoin;
        uint256 usdcCoin;
    }
    mapping(address => ativistBank) public depositToActivist;
    IERC20 internal CusdERC;

    /**
     * IMPORTANT: replace the address below with the WitnetPriceRouter address
     * of the network you are using! Please find the address here:
     * https://docs.witnet.io/smart-contracts/price-feeds/contract-addresses
     */
    constructor() {
        owner = msg.sender;
        witnetPriceRouter = IWitnetPriceRouter(
            0x6f8A7E2bBc1eDb8782145cD1089251f6e2C738AE
        );
        updateCeloUSDPriceFeed();
        CusdERC = IERC20(0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1);
    }

    deposit internal dep;
    uint256 public index = 0;
    event depositLogs(
        address indexed from,
        address indexed to,
        uint256 value,
        uint256 time
    );
    event activistPayment(address indexed ativist, uint256 value, uint256 time);

    mapping(address => deposit) public depositersLogs;
    mapping(address => mapping (address => uint256)) public contribution;
    address owner;

    bool internal locked;

    modifier nonReentrant() {
        require(!locked);
        locked = true;
        _;
        locked = false;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /// Detects if the WitnetPriceRouter is now pointing to a different IWitnetPriceFeed implementation:
    function updateCeloUSDPriceFeed() public {
        IERC165 _newPriceFeed = witnetPriceRouter.getPriceFeed(
            bytes4(0x9ed884be)
        );
        if (address(_newPriceFeed) != address(0)) {
            celoUsdPrice = IWitnetPriceFeed(address(_newPriceFeed));
        }
    }

    function updateCeloEurPriceFeed() public {
        IERC165 _newPriceFeed = witnetPriceRouter.getPriceFeed(
            bytes4(0x21a79821)
        );
        if (address(_newPriceFeed) != address(0)) {
            celoEurPrice = IWitnetPriceFeed(address(_newPriceFeed));
        }
    }

    function updateEthUsdPriceFeed() public {
        IERC165 _newPriceFeed = witnetPriceRouter.getPriceFeed(
            bytes4(0x3d15f701)
        );
        if (address(_newPriceFeed) != address(0)) {
            EthUsdPrice = IWitnetPriceFeed(address(_newPriceFeed));
        }
    }

    /// Returns the CELO / USD price (6 decimals), ultimately provided by the Witnet oracle, and
    /// the timestamps at which the price was reported back from the Witnet oracle's sidechain
    /// to Celo Alfajores.
    function getCeloUsdPrice()
        internal
        view
        returns (int256 _lastPrice, uint256 _lastTimestamp)
    {
        (_lastPrice, _lastTimestamp, , ) = celoUsdPrice.lastValue();
    }

    // Returns the CELO / EUR price (6 decimals), ultimately provided by the Witnet oracle, and
    /// the timestamps at which the price was reported back from the Witnet oracle's sidechain
    /// to Celo Alfajores.
    function getCeloEurPrice()
        internal
        view
        returns (int256 _lastPrice, uint256 _lastTimestamp)
    {
        (_lastPrice, _lastTimestamp, , ) = celoEurPrice.lastValue();
    }

    // Returns the ETH / USD price (6 decimals), ultimately provided by the Witnet oracle, and
    /// the timestamps at which the price was reported back from the Witnet oracle's sidechain
    /// to Celo Alfajores.
    function getEthUsdPrice()
        internal
        view
        returns (int256 _lastPrice, uint256 _lastTimestamp)
    {
        (_lastPrice, _lastTimestamp, , ) = EthUsdPrice.lastValue();
    }

    // returns the result if the depositer does exist true else false
    function checkDepositExist(address wallet) public view returns (bool) {
        if (depositersLogs[wallet].id > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Deposit Celo
    function DepositCelo(address[] memory activists,uint256[] memory amount)
        external
        payable
        nonReentrant
        returns (uint256 totalValueUsd, int256 currentCeloUsdPrice)
    {
        require(
            msg.sender.balance >= msg.value,
            "your balance is not sufficient"
        );
        int256 currentCeloUsdPrice;
        uint256 lastTime;
        (currentCeloUsdPrice, lastTime) = getCeloUsdPrice();
        uint256 totalValueDeposit;
        require(
            int256(msg.value) >= 1 / currentCeloUsdPrice,
            "please send celo amount >= 20 USD"
        );
        int256 totalValueUsd = int256((msg.value)) * (currentCeloUsdPrice);
            depositersLogs[msg.sender].totalDepositsValue += totalValueUsd;
            depositersLogs[msg.sender].totalDepositTimes++;
            for (uint i; i < activists.length ; i++ )
            {
                int256 totalValueUSD = int256((amount[i])) * (currentCeloUsdPrice);
                depositToActivist[activists[i]].usdcCoin += uint256(totalValueUSD);
                contribution[msg.sender][activists[i]] += uint256(totalValueUSD);
                emit depositLogs(msg.sender, activists[i], msg.value, block.timestamp);

            }
             
        
        index++;
        
    }
    //deposit CUSD credit card gateway
    function DepositCusdCredit(address contributer,address _to,uint256 amount

    )
        public
        onlyOwner
        nonReentrant
        returns (bool)
    {
        
        int256 currentCeloUsdPrice;
        uint256 lastTime;
        (currentCeloUsdPrice, lastTime) = getCeloUsdPrice();
        index++;
        depositersLogs[contributer].id = index;
        depositersLogs[contributer].totalDepositsValue += int256(amount) * currentCeloUsdPrice;
        depositersLogs[contributer].userWallet = address(contributer);
        depositersLogs[contributer].totalDepositTimes += 1;
        depositToActivist[_to].usdcCoin += amount;
        //emit depositLogs(contributer, _to, amount, block.timestamp);
        return true;
    }
    // Deposit CUSD  token address 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 returns true or error
    function DepositCusd(uint256 amount,
    address[] memory activists,uint256[] memory Arramount)
        external       
        nonReentrant
        returns (bool)
    {
        require(
            msg.sender.balance >= amount,
            "your balance is not sufficient"
        );
        require(amount >= 1, "Thanks to deposit more cusd");
        index++;
        (int256 currentCeloUsdPrice, uint256 lastTime) = getCeloUsdPrice();
            depositersLogs[msg.sender].totalDepositsValue +=
                int256(amount) *
                currentCeloUsdPrice;
            depositersLogs[msg.sender].totalDepositTimes++;
            CusdERC.transferFrom(msg.sender, address(this), amount);
            for (uint i; i < activists.length ; i++ )
            {
                int256 totalValueUSD = int256((Arramount[i])) * (currentCeloUsdPrice);
                depositToActivist[activists[i]].usdcCoin += uint256(totalValueUSD);
                contribution[msg.sender][activists[i]] += uint256(totalValueUSD);
                emit depositLogs(msg.sender, activists[i], amount, block.timestamp);

            }
            return true;
        
      
    }

    function withdrowCelo(address payable _to)
        external
        payable
        nonReentrant
        returns (uint256, uint256)
    {
        require(
            depositToActivist[_to].celoCoin >= msg.value,
            "not sufficient "
        );
        (int256 currentCeloUsdPrice, uint256 lastTime) = getCeloUsdPrice();

        uint256 amount = ((depositToActivist[_to].celoCoin) +
            (depositToActivist[_to].usdcCoin / uint256(currentCeloUsdPrice))) /
            12;
        _to.transfer(amount);

        if (depositToActivist[_to].celoCoin == 0) {
            depositToActivist[_to].usdcCoin -= amount;
        } else if (depositToActivist[_to].usdcCoin == 0) {
            depositToActivist[_to].celoCoin -= amount;
        } else {
            depositToActivist[_to].celoCoin -= amount / 2;
            depositToActivist[_to].usdcCoin -= amount / 2;
        }
        emit activistPayment(_to, amount, block.timestamp);
        return (amount, block.timestamp);
    }

    function withdrowCusd(address _to)
        external
        nonReentrant
        onlyOwner
        returns (uint256, uint256)
    {
        (int256 currentCeloUsdPrice, uint256 lastTime) = getCeloUsdPrice();
        uint256 amount = ((depositToActivist[_to].celoCoin *
            uint256(currentCeloUsdPrice)) + (depositToActivist[_to].usdcCoin)) /
            12;
        require(depositToActivist[_to].usdcCoin > amount, "not sufficient ");

        CusdERC.transfer(_to,amount);
     
        depositToActivist[_to].celoCoin -= amount;
        emit activistPayment(_to, amount, block.timestamp);
        return (amount, block.timestamp);
    }
}