// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.3;

contract ActivistsManagement {
    // Activist structure
    struct Activist {
        uint256 id;
        string nom;
        string prenom;
        string email;
        string numTel;
        string url;
    }
    // global activist variabler
    Activist activist;
    address owner;
    // Map for storig activists indexed by wallet address
    mapping(address => Activist) public addressToActivist;
    //map for storing acitivst wallet address indexed by id
    mapping(uint256 => address) public ActivistList;
    //index = number and id  of total activist and
    uint256 public index = 0;

    // Ownable modifier for security checks
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    //constructor
    constructor() {
        owner = msg.sender;
    }

    function checkaddressUnicity(address walletActivist)
        internal
        view
        returns (bool)
    {
        bool status = true;
        for (uint256 i = 0; i <= index; i++) {
            if (ActivistList[i] == walletActivist) {
                status = false;
            }
        }
        return status;
    }

    function checkNumtelUnicity(string memory activistNumTel)
        internal
        view
        returns (bool)
    {
        bool status = true;
        address wallet;
        for (uint256 i = 0; i <= index; i++) {
            wallet = ActivistList[i];
            if (
                keccak256(
                    abi.encodePacked((addressToActivist[wallet].numTel))
                ) == keccak256(abi.encodePacked((activistNumTel)))
            ) {
                status = false;
            }
        }
        return status;
    }

    // Add activist by filling Acitivist structure in addressToActivist mapping .
    // Add wallet to activist wallet using id which is index in the same time .
    function addActivist(
        string memory _nom,
        string memory _prenom,
        string memory _email,
        string memory _numTel,
        string memory _url,
        address walletActivist
    ) public onlyOwner returns (bool) {
        require(checkNumtelUnicity(_numTel) == true);
        require(checkaddressUnicity(walletActivist) == true);
        require(
            ActivistList[index] == address(0x0),
            "Activist Does already exist"
        );
        addressToActivist[walletActivist].id = index;
        addressToActivist[walletActivist].nom = _nom;
        addressToActivist[walletActivist].prenom = _prenom;
        addressToActivist[walletActivist].email = _email;
        addressToActivist[walletActivist].numTel = _numTel;
        addressToActivist[walletActivist].url = _url;
        //activists_addresses.push(walletActivist);
        ActivistList[index] = walletActivist;

        index++;
        return true;
    }

    //return activist searched by address
    function searchActivistByAddress(address walletActivist)
        public
        view
        returns (Activist memory)
    {
        return addressToActivist[walletActivist];
    }

    // returns activist searched by id
    function searchActivistById(uint256 idAcitivist)
        public
        view
        returns (Activist memory)
    {
        address wallet = ActivistList[idAcitivist];
        return addressToActivist[wallet];
    }

    // returns name activist searched by id
    function getNomActivistById(uint256 idActivist)
        public
        view
        returns (string memory)
    {
        address wallet = ActivistList[idActivist];
        return addressToActivist[wallet].nom;
    }

    // returns prenom activist searched by id
    function getPrenomActivistById(uint256 idActivist)
        public
        view
        returns (string memory)
    {
        address wallet = ActivistList[idActivist];
        return addressToActivist[wallet].prenom; //Delete Activist account by owner searched by wallet address
    }

    // returns email activist searched by id
    function getEmailActivistById(uint256 idActivist)
        public
        view
        returns (string memory)
    {
        address wallet = ActivistList[idActivist];
        return addressToActivist[wallet].email;
    }

    // returns Phone number activist searched by id
    function getNumTelActivistById(uint256 idActivist)
        public
        view
        returns (string memory)
    {
        address wallet = ActivistList[idActivist];
        return addressToActivist[wallet].numTel;
    }

    // returns url activist searched by id
    function getURLActivistBytId(uint256 idActivist)
        public
        view
        returns (string memory)
    {
        address wallet = ActivistList[idActivist];
        return addressToActivist[wallet].url;
    }

    // returns name activist searched by address
    function getNomActivistByAddress(address walletActivist)
        public
        view
        returns (string memory)
    {
        return searchActivistByAddress(walletActivist).nom;
    }

    // returns prenom activist searched by address
    function getPrenomActivistByAddress(address walletActivist)
        public
        view
        returns (string memory)
    {
        return searchActivistByAddress(walletActivist).prenom;
    }

    // returns email activist searched by address
    function getEmailActivistByAddress(address walletActivist)
        public
        view
        returns (string memory)
    {
        return searchActivistByAddress(walletActivist).email;
    }

    // returns phone number activist searched by address
    function getNumTelActivistByAddress(address walletActivist)
        public
        view
        returns (string memory)
    {
        return searchActivistByAddress(walletActivist).numTel;
    }

    // returns url activist searched by address
    function getURLActivistBytAddress(address walletActivist)
        public
        view
        returns (string memory)
    {
        return searchActivistByAddress(walletActivist).url;
    }

    // update all attributes of activist searched by wakket address
    function updateActivistByAddress(
        address walletActivist,
        string memory _nom,
        string memory _prenom,
        string memory _email,
        string memory _numTel,
        string memory _url
    ) public returns (bool) {
        //use should exist in the map
        require(
            ActivistList[addressToActivist[walletActivist].id] ==
                walletActivist,
            "activist does not exist"
        );
        activist = searchActivistByAddress(walletActivist);
        activist.nom = _nom;
        activist.prenom = _prenom;
        activist.email = _email;
        activist.numTel = _numTel;
        activist.url = _url;
        addressToActivist[walletActivist] = activist;
        return true;
    }

    //Set nom activist searched by wallet address
    function setNomActivistbyAddress(address walletActivist, string memory _nom)
        public
    {
        addressToActivist[walletActivist].nom = _nom;
    }

    //Set prenom activist searched by wallet address
    function setPrenomActivistbyAddress(
        address walletActivist,
        string memory _prenom
    ) public {
        addressToActivist[walletActivist].prenom = _prenom;
    }

    //Set Email activist searched by wallet address
    function setEmailActivistbyAddress(
        address walletActivist,
        string memory _email
    ) public {
        addressToActivist[walletActivist].email = _email;
    }

    //Set Phone number activist searched by wallet address
    function setNumTelActivistbyAddress(
        address walletActivist,
        string memory _numTel
    ) public {
        addressToActivist[walletActivist].numTel = _numTel;
    }

    //Set URL activist searched by wallet address
    function setUrlActivistbyAddress(address walletActivist, string memory _url)
        public
    {
        addressToActivist[walletActivist].url = _url;
    }

    //Delete Activist account by the same activist
    function deleteActivistByAddress(address walletActivist)
        public
        returns (bool)
    {
        require(
            msg.sender == walletActivist,
            "Only activist can delete his account using this method"
        );
        uint256 id = addressToActivist[walletActivist].id;
        delete ActivistList[id];
        delete addressToActivist[walletActivist];
        index--;
        return true;
    }

    //Delete Activist account by owner searched by wallet address
    function deleteActivistByOwnerByAddress(address walletActivist)
        public
        onlyOwner
        returns (bool)
    {
        uint256 id = addressToActivist[walletActivist].id;
        delete ActivistList[id];
        delete addressToActivist[walletActivist];
        index--;
        return true;
    }

    //Delete Activist account by owner searched by activist id
    function deleteActivistByOwnerById(uint256 idActivist)
        public
        onlyOwner
        returns (bool)
    {
        address wallet = ActivistList[idActivist];
        delete addressToActivist[wallet];
        delete ActivistList[idActivist];
        index--;
        return true;
    }

    //Get all activists

    function getAllActivists()
        public
        view
        onlyOwner
        returns (
            address[] memory,
            Activist[] memory,
            uint256
        )
    {
        address[] memory maddresses = new address[](index);
        Activist[] memory mactivists = new Activist[](index);

        for (uint256 i = 0; i <= index; i++) {
            maddresses[i] = ActivistList[i];
            mactivists[i] = addressToActivist[ActivistList[i]];
        }
        return (maddresses, mactivists, index);
    }
}
