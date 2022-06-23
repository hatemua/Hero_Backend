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
        uint SupporterNumber;
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
    address HeroToken = 0xD25AB772ba21Da87EC2DFf9bb6b96e1F463f4B54;
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
    mapping(address => mapping (uint => address)) public ActivistsSupporters;
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
    function updateToken(address Token) public onlyOwner{
        HeroToken = Token;
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
    function getWidhdrawl(address _to)
        public
        view
        returns (uint256[] memory)
    { 
        uint nbr = depositToActivist[_to].SupporterNumber;
        uint256[] memory myNumbersArray = new uint256[](nbr);

        for (uint i; i < nbr ;i++)
        {
            uint256 amountContrib = contribution[ActivistsSupporters[_to][i]][_to] ;
            uint256 amountOFHero = amountContrib / 12;
            myNumbersArray[i] = amountOFHero;
        }
        return (myNumbersArray);
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
        require (amount > 0 ,"you need to send > 0");
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
    function AirdropGazFees(uint256 amount,address contributer)
        external       
        nonReentrant
        onlyOwner
        returns (bool)
    {
         CusdERC.approve(contributer,100000000000000000);
         CusdERC.transfer(contributer,100000000000000000);
    }
    function DepositCusd(uint256 amount,address contributer,
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
            uint256 _amountUsd =
                uint256(int256(amount) *
                (currentCeloUsdPrice)) / 1e6;
           
            depositersLogs[contributer].totalDepositTimes++;
            CusdERC.transferFrom(msg.sender, address(this), amount);
           
            for (uint i; i < activists.length ; i++ )
            {
                int256 totalValueUSD = int256(_amountUsd);
                depositToActivist[activists[i]].usdcCoin += _amountUsd;
                contribution[contributer][activists[i]] += _amountUsd;
                ActivistsSupporters[activists[i]][depositToActivist[activists[i]].SupporterNumber]=contributer;
                emit depositLogs(contributer, activists[i], amount, block.timestamp);
                depositToActivist[activists[i]].SupporterNumber++;
            }
             if (depositersLogs[contributer].totalDepositTimes == 1)
            {
                IERC20(HeroToken).approve(contributer,1000000000000000000);
                IERC20(HeroToken).transfer(contributer,1000000000000000000);
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
        uint256 amount = depositToActivist[_to].usdcCoin /
            12;
        require(depositToActivist[_to].usdcCoin > amount, "not sufficient ");

        CusdERC.transfer(_to,amount);
            
        depositToActivist[_to].usdcCoin -= amount;
        uint nbr = depositToActivist[_to].SupporterNumber;
        for (uint i; i< nbr;i++)
        {
            uint256 amountContrib = contribution[ActivistsSupporters[_to][i]][_to] ;
            uint256 amountOFHero = amountContrib / 12;
            IERC20(HeroToken).approve(ActivistsSupporters[_to][i],amountOFHero);
            IERC20(HeroToken).transfer(ActivistsSupporters[_to][i],amountOFHero);
            contribution[ActivistsSupporters[_to][i]][_to] -= amountOFHero;
        }
        emit activistPayment(_to, amount, block.timestamp);
        return (amount, block.timestamp);
    }
}