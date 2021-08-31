// 
var MeetupFriends = artifacts.require("./MeetupFriends.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MeetupFriends);
};
