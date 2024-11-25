import Web3 from 'web3';

let web3: Web3;
let contract: any;
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const contractABI: any[] = [/* YOUR_CONTRACT_ABI */];

interface PageContent {
    title: string;
    content: string;
}

const pages: Record<string, PageContent> = {
    home: {
        title: 'Welcome to Voting dApp',
        content: `
            <h1>Welcome to Voting dApp</h1>
            <button id="connectButton">Connect Wallet</button>
            <p>A decentralized voting platform for transparent elections</p>
        `
    },
    register: {
        title: 'Register to Vote',
        content: `
            <h1>Register to Vote</h1>
            <button id="registerButton">Register</button>
        `
    },
    vote: {
        title: 'Cast Your Vote',
        content: `
            <h1>Cast Your Vote</h1>
            <div id="candidatesList"></div>
        `
    },
    dashboard: {
        title: 'Voting Dashboard',
        content: `
            <h1>Voting Dashboard</h1>
            <p>Dashboard coming soon...</p>
        `
    }
};

function updateContent(pageId: string): void {
    const contentDiv = document.getElementById('content');
    const page = pages[pageId] || pages.home;
    
    if (contentDiv) {
        contentDiv.innerHTML = page.content;
    }
    
    document.title = `Voting dApp - ${page.title}`;
    
    // Reattach event listeners
    if (pageId === 'home') {
        const connectButton = document.getElementById('connectButton');
        if (connectButton) {
            connectButton.addEventListener('click', connectWallet);
        }
    } else if (pageId === 'register') {
        const registerButton = document.getElementById('registerButton');
        if (registerButton) {
            registerButton.addEventListener('click', registerUser);
        }
    } else if (pageId === 'vote') {
        displayCandidates();
    }
}

async function connectWallet(): Promise<void> {
    console.log('Connecting wallet...');
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
}

function handleNavigation(): void {
    const pageId = window.location.hash.slice(1) || 'home';
    updateContent(pageId);
}

async function initContract() {
    contract = new web3.eth.Contract(contractABI, contractAddress);
    document.getElementById('loginButton')!.style.display = 'none';
    document.getElementById('votingSection')!.style.display = 'block';
    await addPredefinedCandidates();
}

async function registerUser(): Promise<void> {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const amount = web3.utils.toWei('10', 'ether'); // Example token amount
    await contract.methods.registerUser(account, amount).send({ from: account });
    alert('User registered successfully!');
}

async function addPredefinedCandidates(): Promise<void> {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const candidates = ["Alice", "Bob"];
    for (const candidate of candidates) {
        await contract.methods.addCandidate(candidate).send({ from: account });
    }
    console.log('Predefined candidates added successfully!');
}

async function displayCandidates(): Promise<void> {
    const candidatesListDiv = document.getElementById('candidatesList');
    const candidatesCount = await contract.methods.getCandidatesCount().call();
    
    if (candidatesListDiv) {
        candidatesListDiv.innerHTML = '';
        for (let i = 1; i <= candidatesCount; i++) {
            const candidate = await contract.methods.getCandidate(i).call();
            const candidateElement = document.createElement('div');
            candidateElement.innerHTML = `
                <p>Candidate ${candidate[0]}: ${candidate[1]}</p>
                <button onclick="vote(${candidate[0]})">Vote for ${candidate[1]}</button>
            `;
            candidatesListDiv.appendChild(candidateElement);
        }
    } else {
        console.error('candidatesListDiv not found');
    }
}

async function vote(candidateId: number): Promise<void> {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    await contract.methods.vote(candidateId).send({ from: account });
    alert('Vote cast successfully!');
}

// Event listeners
window.addEventListener('hashchange', handleNavigation);
window.addEventListener('DOMContentLoaded', handleNavigation);