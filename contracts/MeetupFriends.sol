// specify which solidity compiler to use.
pragma solidity >=0.6.0;

// import ERC721 contract from openzeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MeetupFriends is ERC721 {
    uint256 _tokenId;

    constructor() public ERC721("MeetupFriends", "MF") {}

    function mintMeetupFriend(string memory tokenUri) public {
        _safeMint(_msgSender(), _tokenId);
        _setTokenURI(_tokenId, tokenUri);
        _tokenId++;
    }
}
