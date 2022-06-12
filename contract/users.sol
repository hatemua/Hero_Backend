// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.3;


contract user {

    // Utilisateur structure 
    struct  Utilisateur {
        uint id;
        string nom;
        string prenom; 
        string email;
        string numTel;
        string url;
    }
    // global Utilisateur variabler 
    Utilisateur utilisateur;
    address owner; 
    // Map for storig Utilisateurs indexed by wallet address
    mapping  (address => Utilisateur) public addressToUtilisateur;
    //map for storing acitivst wallet address indexed by id 
    mapping  (uint  => address) public UtilisateurList;
    //index = number and id  of total Utilisateur and
    mapping  (string  => uint) public UtilisateurPhoneList;
    uint public index = 0; 
    
    // Ownable modifier for security checks 
    modifier onlyOwner(){
        require (msg.sender == owner);
        _;
    }
    //constructor
    constructor ()   {
        owner = msg.sender;
    }

    function checkaddressUnicity(address walletUtilisateur) internal  view returns (bool){
        bool status = true;
        for (uint i=0; i<=index;i++){
            if(UtilisateurList[i] == walletUtilisateur){
                status = false;
            } 
        }
        return status;
    }
    function checkNumtelUnicity(string memory utilisateurNumTel) internal  view returns(bool){
        bool status = true;
        address wallet;
        for (uint i=0; i<=index; i++){
            wallet = UtilisateurList[i];
            if(keccak256(abi.encodePacked((addressToUtilisateur[wallet].numTel))) == keccak256(abi.encodePacked((utilisateurNumTel)))){
                status = false;
            }
        }
        return status;
    }
    // Add Utilisateur by filling Acitivist structure in addressToUtilisateur mapping .
    // Add wallet to utilisateur wallet using id which is index in the same time . 
    function addUtilisateur (string memory _nom ,string memory _prenom , 
                        string memory  _email ,string memory _numTel ,
                        string memory _url,address walletUtilisateur  ) public   onlyOwner 
                        returns (bool)
    {
        require(checkNumtelUnicity(_numTel)== true);
        require (checkaddressUnicity(walletUtilisateur) == true);
        require(UtilisateurList[index] == address(0x0), "Utilisateur Does already exist");
        addressToUtilisateur[walletUtilisateur].id = index;
        addressToUtilisateur[walletUtilisateur].nom = _nom;
        addressToUtilisateur[walletUtilisateur].prenom = _prenom;
        addressToUtilisateur[walletUtilisateur].email = _email;
        addressToUtilisateur[walletUtilisateur].numTel = _numTel;
        addressToUtilisateur[walletUtilisateur].url = _url;
        UtilisateurPhoneList[_numTel] = index;
        //Utilisateurs_addresses.push(walletUtilisateur);
        UtilisateurList[index] = walletUtilisateur;

        index++;
        return true;
    }
    //return Utilisateur searched by address 
    function searchUtilisateurByAddress(address walletUtilisateur)  public view returns (Utilisateur memory ){
        return addressToUtilisateur[walletUtilisateur];
    }
    // returns Utilisateur searched by id 
    function searchUtilisateurById(uint idAcitivist) public view returns(Utilisateur memory){
        address wallet = UtilisateurList[idAcitivist] ;
        return addressToUtilisateur[wallet];
    }
    // returns name Utilisateur searched by id 
    function getNomUtilisateurById(uint idUtilisateur) public view  returns (string memory){
        address wallet = UtilisateurList[idUtilisateur];
        return addressToUtilisateur[wallet].nom;
    }
     // returns prenom Utilisateur searched by id 
    function getPrenomUtilisateurById(uint idUtilisateur) public view returns (string memory){
        address wallet = UtilisateurList[idUtilisateur];
        return addressToUtilisateur[wallet].prenom;    //Delete Utilisateur account by owner searched by wallet address

    }
    // returns email Utilisateur searched by id 
    function getEmailUtilisateurById(uint idUtilisateur) public view returns (string memory){
        address wallet = UtilisateurList[idUtilisateur];
        return addressToUtilisateur[wallet].email;
    }
    // returns Phone number Utilisateur searched by id 
    function getNumTelUtilisateurById(uint idUtilisateur) public view returns (string memory){
        address wallet = UtilisateurList[idUtilisateur];
        return addressToUtilisateur[wallet].numTel;
    }
    // returns url Utilisateur searched by id 
    function getURLUtilisateurBytId(uint idUtilisateur) public view returns (string memory){
        address wallet = UtilisateurList[idUtilisateur];
        return addressToUtilisateur[wallet].url;
    }
    // returns name Utilisateur searched by address
    function getNomUtilisateurByAddress(address walletUtilisateur) public view  returns (string memory){
        return searchUtilisateurByAddress(walletUtilisateur).nom;
    }

    // returns prenom Utilisateur searched by address
    function getPrenomUtilisateurByAddress(address walletUtilisateur) public view returns (string memory){
        return searchUtilisateurByAddress(walletUtilisateur).prenom;

    }
    // returns email Utilisateur searched by address
    function getEmailUtilisateurByAddress(address walletUtilisateur) public view returns (string memory){
        return searchUtilisateurByAddress(walletUtilisateur).email;

    }
    // returns phone number Utilisateur searched by address
    function getNumTelUtilisateurByAddress(address walletUtilisateur) public view returns (string memory){
        return searchUtilisateurByAddress(walletUtilisateur).numTel;

    }
    // returns url Utilisateur searched by address
    function getURLUtilisateurBytAddress(address walletUtilisateur) public view returns (string memory){
        return searchUtilisateurByAddress(walletUtilisateur).url;

    }
    // update all attributes of Utilisateur searched by wakket address
    function updateUtilisateurByAddress(address walletUtilisateur, string memory _nom , string memory _prenom, string memory _email, 
                                    string memory  _numTel,string memory _url  ) 
    public  returns (bool){
        //use should exist in the map
        require(UtilisateurList[addressToUtilisateur[walletUtilisateur].id] == walletUtilisateur, "Utilisateur does not exist");
        utilisateur =  searchUtilisateurByAddress(walletUtilisateur);
        utilisateur.nom = _nom;
        utilisateur.prenom = _prenom;
        utilisateur.email = _email;
        utilisateur.numTel = _numTel;
        utilisateur.url = _url;
        addressToUtilisateur[walletUtilisateur]  = utilisateur;
        return true;
    }
    //Set nom Utilisateur searched by wallet address
    function setNomUtilisateurbyAddress(address walletUtilisateur, string memory _nom) public {
        addressToUtilisateur[walletUtilisateur].nom = _nom;
    }
    //Set prenom Utilisateur searched by wallet address
    function setPrenomUtilisateurbyAddress(address walletUtilisateur, string memory _prenom) public {
        addressToUtilisateur[walletUtilisateur].prenom = _prenom;
    }
    //Set Email Utilisateur searched by wallet address
    function setEmailUtilisateurbyAddress(address walletUtilisateur, string memory _email) public {
        addressToUtilisateur[walletUtilisateur].email = _email;
    }
    //Set Phone number Utilisateur searched by wallet address
    function setNumTelUtilisateurbyAddress(address walletUtilisateur, string memory _numTel) public {
        addressToUtilisateur[walletUtilisateur].numTel = _numTel;
    }
    //Set URL Utilisateur searched by wallet address
    function setUrlUtilisateurbyAddress(address walletUtilisateur, string memory _url) public {
        addressToUtilisateur[walletUtilisateur].url = _url;
    }
    //Delete Utilisateur account by the same Utilisateur 
    function deleteUtilisateurByAddress(address walletUtilisateur) public returns(bool){
        require(msg.sender == walletUtilisateur,"Only Utilisateur can delete his account using this method");
        uint id = addressToUtilisateur[walletUtilisateur].id ;
        delete UtilisateurList[id];
        delete addressToUtilisateur[walletUtilisateur];
        index--;
        return true;
    }
    //Delete Utilisateur account by owner searched by wallet address
    function deleteUtilisateurByOwnerByAddress(address walletUtilisateur) public onlyOwner returns (bool){
        uint id  = addressToUtilisateur[walletUtilisateur].id;
        delete UtilisateurList[id];
        delete addressToUtilisateur[walletUtilisateur];
        index--;
        return true;
    }
    //Delete Utilisateur account by owner searched by Utilisateur id 
    function deleteUtilisateurByOwnerById(uint idUtilisateur) public onlyOwner returns (bool){
        address wallet = UtilisateurList[idUtilisateur];
        delete addressToUtilisateur[wallet];
        delete UtilisateurList[idUtilisateur];
        index--;
        return true;
    }
    //Get all Utilisateurs
    
    function getAllUtilisateur() public onlyOwner view returns(address[] memory,Utilisateur[] memory, uint){
        address[] memory maddresses = new address[] (index);
        Utilisateur[] memory mautilisateurs = new Utilisateur[] (index);

        for(uint i=0;i<=index; i++ ){
            maddresses[i] = UtilisateurList[i];
            mautilisateurs[i] = addressToUtilisateur[UtilisateurList[i]];
        }
        return (maddresses, mautilisateurs , index) ;
    }
}
