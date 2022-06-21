// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



contract Dao {

    address public owner;
    uint256 nextProposal;
    uint256[] public validTokens;
    address HeroToken;
    constructor(){
        owner = msg.sender;
        nextProposal = 1;
        
    }
     modifier onlyOwner
    {
        require(owner == msg.sender);
         _ ;
    }
    struct proposal{
        uint256 id;
        bool exists;
        string description;
        uint deadline;
        uint256 votesUp;
        uint256 votesDown;
        address[] canVote;
        uint256 maxVotes;
        bool highLevel;
        mapping(address => bool) voteStatus;
        bool countConducted;
        bool passed;
    }
    struct prop{
        string description;
        uint deadline;
        
    }
    mapping(uint256 => proposal) public Proposals;

    event proposalCreated(
        uint256 id,
        string description,
        uint256 maxVotes,
        address proposer
    );

    event newVote(
        uint256 votesUp,
        uint256 votesDown,
        address voter,
        uint256 proposal,
        bool votedFor
    );

    event proposalCount(
        uint256 id,
        bool passed
    );


   

    function checkVoteEligibility(address _voter) private view returns (
        bool
    ){
        uint tokens = ERC20(HeroToken).balanceOf(_voter);
        if (tokens>=1)
        {
            return true;
        }
        else{
            return false;
        }
        
    }


    function createProposal(string memory _description,uint256 deadline_,bool isHighLevel) onlyOwner public {
        
        proposal storage newProposal = Proposals[nextProposal];
        newProposal.id = nextProposal;
        newProposal.exists = true;
        newProposal.description = _description;
        newProposal.deadline = block.timestamp + (deadline_ * 1 days);
        newProposal.highLevel = isHighLevel;

        nextProposal++;
    }


    function voteOnProposal(uint256 _id, bool _vote) public {
        require(Proposals[_id].exists, "This Proposal does not exist");
        require(checkVoteEligibility(msg.sender), "You can not vote on this Proposal");
        require(!Proposals[_id].voteStatus[msg.sender], "You have already voted on this Proposal");
        require(block.timestamp <= Proposals[_id].deadline, "The deadline has passed for this Proposal");
        
        proposal storage p = Proposals[_id];

        if(_vote) {
            p.votesUp++;
        }else{
            p.votesDown++;
        }
        ERC20(HeroToken).transferFrom(msg.sender,address(this),1 ether);
        p.voteStatus[msg.sender] = true;

        emit newVote(p.votesUp, p.votesDown, msg.sender, _id, _vote);
        
    }
    function updateToken(address _HeroToken) public {
        HeroToken = _HeroToken;
    }
    function updateToken() public view returns (address) {
        return (HeroToken);
    }
    function countVotes(uint256 _id) public view returns(uint256[] memory){
        require(Proposals[_id].exists, "This Proposal does not exist");

        proposal storage p = Proposals[_id];
        
        uint256[] memory yesOrNo = new uint256[](2);
        yesOrNo[0]= p.votesUp;
        yesOrNo[1]= p.votesDown;

        return (yesOrNo);
    }
     function printProposal(uint256 _id) public view returns(prop memory){
        require(Proposals[_id].exists, "This Proposal does not exist");

        proposal storage p = Proposals[_id];
        
        prop memory pp;
        pp.description = p.description;
        pp.deadline = p.deadline;

        return (pp);
    }
    
}