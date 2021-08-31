import React, { Component } from "react";
import MeetupFriendsContract from "./contracts/MeetupFriends.json";
import getWeb3 from "./getWeb3";
import axios from "axios";

import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    name: null,
    description: null,
    file: null,
    ipfsLink: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log("networkId", networkId);
      const deployedNetwork = MeetupFriendsContract.networks[networkId];
      console.log(deployedNetwork.address)
      const instance = new web3.eth.Contract(
        MeetupFriendsContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { name, description, file, contract, accounts } = this.state;
    let data = new FormData();
    data.append("file", file);
    this.uploadFileToIPFS(data)
      .then((response) => {
        const { IpfsHash } = response.data;
        const json = {
          name,
          description,
          image: `https://ipfs.io/ipfs/${IpfsHash}`,
        };
        return this.uploadJSONToIPFS(json);
      })
      .then(async (response) => {
        const { IpfsHash } = response.data;
        const tokenUri = `https://ipfs.io/ipfs/${IpfsHash}`;
        this.setState(() => ({
          ipfsLink: tokenUri,
        }));
        await contract.methods.mintMeetupFriend(tokenUri).send({ from: accounts[0] });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // do not expose keys in frontend. Should be done in backend.
  uploadFileToIPFS = (data) => {
    return axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
      headers: {
        pinata_api_key: "f7495897807b44ae8ea0",
        pinata_secret_api_key:
          "10a78c38c207b700fb0e55a2466fe67b0fac2fd1e4ad471f6d3f290aa8e25393",
      },
    });
  };

  // do not expose keys in frontend. Should be done in backend.
  uploadJSONToIPFS = (json) => {
    return axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", json, {
      headers: {
        pinata_api_key: "f7495897807b44ae8ea0",
        pinata_secret_api_key:
          "10a78c38c207b700fb0e55a2466fe67b0fac2fd1e4ad471f6d3f290aa8e25393",
      },
    });
  };

  onNameChange = (e) => {
    const name = e.target.value;
    this.setState(() => ({ name }));
  };

  onDescriptionChange = (e) => {
    const description = e.target.value;
    this.setState(() => ({ description }));
  };

  onFileChange = (e) => {
    const file = e.target.files[0];
    this.setState(() => ({ file }));
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <form onSubmit={this.onSubmit}>
          <input
            type="text"
            placeholder="Name"
            onChange={this.onNameChange}
            value={this.state.name}
          />
          <input
            type="text"
            placeholder="Description"
            onChange={this.onDescriptionChange}
            value={this.state.description}
          />
          <input type="file" onChange={this.onFileChange} />
          <button>Create NFT</button>
        </form>
        {this.state.ipfsLink && (
          <p>
            Your NFT Metadata are here:{" "}
            <a target="_blank" href={`${this.state.ipfsLink}`}>
              {this.state.ipfsLink}
            </a>
          </p>
        )}
      </div>
    );
  }
}

export default App;
