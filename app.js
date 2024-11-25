let web3;
let contract;
const contractAddress = 'user address';
const contractABI = [/* YOUR_CONTRACT_ABI */];

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            initContract();
        } catch (error) {
            console.error("User denied account access");
        }
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

async function initContract() {
    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('votingSection').style.display = 'block';
}

async function vote(candidateId) {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    await contract.methods.vote(candidateId).send({ from: account });
    alert('Vote cast successfully!');
}