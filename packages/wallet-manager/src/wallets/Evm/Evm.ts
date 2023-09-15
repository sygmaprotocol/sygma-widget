import { UnsignedTransaction, ethers, providers } from 'ethers';

class EvmWallet {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metamask: any | undefined;
  account: string | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  balance: string | undefined;

  public connect() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).ethereum !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.metamask = (window as any).ethereum;
      this.provider = new ethers.providers.Web3Provider(this.metamask);
    }
  }

  public async getAccount() {
    if (this.metamask) {
      const accounts = await this.metamask.request({
        method: 'eth_requestAccounts'
      });
      this.account = accounts[0];
    }
  }

  public async getBalance() {
    if (this.account && this.provider) {
      const signer = this.getSigner();
      const balance = await signer?.getBalance();
      this.balance = ethers.utils.formatEther(balance as ethers.BigNumber);
    }
  }

  public getSigner() {
    if (this.provider) {
      return this.provider.getSigner();
    }
  }

  public sendTransaction(approval: UnsignedTransaction) {
    const signer = this.getSigner();
    return signer?.sendTransaction(approval as providers.TransactionRequest);
  }

  get currentAccount() {
    return this.account;
  }

  get currentProvider() {
    return this.provider;
  }

  get currentBalance() {
    return this.balance;
  }
}

export { EvmWallet };
