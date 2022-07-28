import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { presentBalanceFetcherResponse } from '~app-toolkit/helpers/presentation/balance-fetcher-response.present';
import { BalanceFetcher } from '~balance/balance-fetcher.interface';
import { Network } from '~types/network.interface';
import { MasterchefV1, ProtofiContractFactory } from '../contracts';

import { PROTOFI_DEFINITION } from '../protofi.definition';

const appId = PROTOFI_DEFINITION.id;
const network = Network.FANTOM_OPERA_MAINNET;

@Register.BalanceFetcher(PROTOFI_DEFINITION.id, network)
export class FantomProtofiBalanceFetcher implements BalanceFetcher {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(ProtofiContractFactory) private readonly protofiContractFactory: ProtofiContractFactory,
  ) {}

  private async getPoolBalances(address: string) {
    return this.appToolkit.helpers.tokenBalanceHelper.getTokenBalances({
      address,
      appId,
      network,
      groupId: PROTOFI_DEFINITION.groups.pools.id,
    });
  }

  private async getFarmBalances(address: string) {
    // LP and Manual VVS Farms
    return this.appToolkit.helpers.masterChefContractPositionBalanceHelper.getBalances<MasterchefV1>({
      address,
      appId,
      network,
      groupId: PROTOFI_DEFINITION.groups.farms.id,
      resolveChefContract: ({ contractAddress }) =>
        this.protofiContractFactory.masterchefV1({ network, address: contractAddress }),
      resolveStakedTokenBalance: this.appToolkit.helpers.masterChefDefaultStakedBalanceStrategy.build({
        resolveStakedBalance: async ({ multicall, contract, contractPosition }) =>
          multicall
            .wrap(contract)
            .userInfo(contractPosition.dataProps.poolIndex, address)
            .then(v => v.amount),
      }),
      resolveClaimableTokenBalances: this.appToolkit.helpers.masterChefDefaultClaimableBalanceStrategy.build({
        resolveClaimableBalance: ({ multicall, contract, contractPosition }) =>
          multicall.wrap(contract).pendingProton(contractPosition.dataProps.poolIndex, address),
      }),
    });
  }

  async getBalances(address: string) {
    const [
      poolBalances,
      farmBalances,
    ] = await Promise.all([
      this.getPoolBalances(address),
      this.getFarmBalances(address),
    ]);

    return presentBalanceFetcherResponse([
      {
        label: 'Pools',
        assets: poolBalances,
      },
      {
        label: 'Farms',
        assets: farmBalances,
      },
    ]);
  }
}
