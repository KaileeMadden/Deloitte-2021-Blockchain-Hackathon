import React, { Component } from 'react';
import Web3 from 'web3';
import Image from '../abis/Image.json'

const IpfsHttpClient = require('ipfs-http-client');
const ipfs = IpfsHttpClient({host: "ipfs.infura.io", port: "5001", protocol: "https",});

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    //test
  }

  async loadBlockchainData() {
    //get the account
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    console.log(this.state.account)
    //get the network
    const networkID = await web3.eth.net.getId()
    console.log(networkID)
    const networkData = Image.networks[networkID]
    if(networkData) {
      //get abi and address
      const abi = Image.abi
      const address = networkData.address
      //fetch the contract
      const contract = web3.eth.Contract(abi, address)
      this.setState( { contract: contract})
      console.log(contract)
      //get image hash
      const imageHash = await contract.methods.get().call()
      console.log(imageHash)
      this.setState( { imageHash})
    } else {
      window.alert('smart contract not deployed to network')
    }
  }

  constructor(props){
    super(props);
    this.state = {
      account: '',
      buffer:null,
      imageHash: ''
    };
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('please use MetaMask extension')
    }
  }
  
  captureFile = (event) => {
    event.preventDefault()
    //process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result) })
    }
  }

  onSubmit = async (event) => {
    event.preventDefault()
    console.log('Submitting the image...')
    let data = this.state.buffer;
    console.log('Submit this: ', data)
    //submit the image to ipfs
    if (data){
      try{
        //send the image to ipfs
        const postResponse = await ipfs.add(data)
        console.log("postResponse", postResponse)
        //get the imagehash from ipfs
        const imageHash = postResponse.path
        //send the imagehash to the blockchain
        this.state.contract.methods.set(imageHash).send({ from: this.state.account}).then((r) => {
          //set the state once it is successfully saved on the blockchain
          this.setState({ imageHash }) 
        })
      } catch(e){
        console.log("Error: ", e)
      }
    } else{
      alert("No files submitted. Please try again.")
      console.log('ERROR: No data to submit')
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <img src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`} />
                <form onSubmit={this.onSubmit}>
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit'/>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
