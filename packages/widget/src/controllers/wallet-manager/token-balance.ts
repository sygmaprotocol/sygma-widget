import { ERC20__factory } from '@buildwithsygma/sygma-contracts';
import type { EvmResource, Resource } from '@buildwithsygma/sygma-sdk-core';
import { ResourceType } from '@buildwithsygma/sygma-sdk-core';
import { Web3Provider } from '@ethersproject/providers';
import { ContextConsumer } from '@lit/context';
import { BigNumber } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import { walletContext } from '../../context';
import { isEvmResource } from '../../utils';

const BALANCE_REFRESH_MS = 5_000;

export const BALANCE_UPDATE_KEY = 'accountBalance';

export class TokenBalanceController implements ReactiveController {
  host: ReactiveElement;

  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;

  loadingBalance: boolean = true;

  //"wei"
  balance: BigNumber = BigNumber.from(0);
  decimals: number = 18;

  timeout?: ReturnType<typeof setInterval>;

  constructor(host: ReactiveElement) {
    (this.host = host).addController(this);
    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true
    });
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    clearInterval(this.timeout);
  }

  startBalanceUpdates(resource: Resource): void {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
    this.balance = BigNumber.from(0);
    this.host.requestUpdate();
    if (isEvmResource(resource)) {
      if (resource.type === ResourceType.FUNGIBLE) {
        //trigger so we don't wait BALANCE_REFRESH_MS before displaying balance
        void this.subscribeERC20BalanceUpdate(resource);
        this.timeout = setInterval(
          this.subscribeERC20BalanceUpdate,
          BALANCE_REFRESH_MS,
          resource
        );
        return;
      }
      //resource.native is not set :shrug:
      if (resource.symbol === 'eth') {
        void this.subscribeEvmNativeBalanceUpdate();
        this.timeout = setInterval(
          this.subscribeEvmNativeBalanceUpdate,
          BALANCE_REFRESH_MS
        );
        return;
      }
    }
    throw new Error('Unsupported resource');
  }

  resetBalance(): void {
    this.balance = BigNumber.from(0);
  }

  subscribeERC20BalanceUpdate = (resource: EvmResource): void => {
    const provider = this.walletContext.value?.evmWallet?.provider;
    const address = this.walletContext.value?.evmWallet?.address;
    if (!provider || !address) return;

    const web3Provider = new Web3Provider(provider);
    const ierc20 = ERC20__factory.connect(resource.address, web3Provider);
    void async function (this: TokenBalanceController) {
      this.loadingBalance = true;
      this.host.requestUpdate();
      this.decimals = await ierc20.decimals();
      this.balance = await ierc20.balanceOf(address);
      this.loadingBalance = false;
      this.host.requestUpdate(BALANCE_UPDATE_KEY);
    }.bind(this)();
  };

  subscribeEvmNativeBalanceUpdate = (): void => {
    const provider = this.walletContext.value?.evmWallet?.provider;
    const address = this.walletContext.value?.evmWallet?.address;
    if (!provider || !address) return;

    const web3Provider = new Web3Provider(provider);
    void async function (this: TokenBalanceController) {
      this.loadingBalance = true;
      this.host.requestUpdate();
      const balance = await web3Provider.getBalance(address);
      this.loadingBalance = false;
      this.balance = balance;
      this.decimals = 18;
      this.host.requestUpdate();
    }.bind(this)();
  };
}
