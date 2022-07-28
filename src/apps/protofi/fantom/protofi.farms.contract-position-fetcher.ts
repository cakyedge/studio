import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { RewardRateUnit } from '~app-toolkit/helpers/master-chef/master-chef.contract-position-helper';
import { getLabelFromToken } from '~app-toolkit/helpers/presentation/image.present';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { MasterchefV1, ProtofiContractFactory } from '../contracts';
import { PROTOFI_DEFINITION } from '../protofi.definition';

const appId = PROTOFI_DEFINITION.id;
const groupId = PROTOFI_DEFINITION.groups.farms.id;
const network = Network.FANTOM_OPERA_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class FantomProtofiFarmsContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(ProtofiContractFactory) private readonly protofiContractFactory: ProtofiContractFactory,
  ) {}

  async getPositions() {
    const positions = await this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<MasterchefV1>(
      {
        network,
        groupId,
        appId,
        address: '0xa71f52aee8311c22b6329EF7715A5B8aBF1c6588',
        dependencies: [{ appId, groupIds: [PROTOFI_DEFINITION.groups.pools.id], network }],
        resolveContract: opts => this.protofiContractFactory.masterchefV1(opts),
        resolvePoolLength: ({ multicall, contract }) => multicall.wrap(contract).poolLength(),
        resolveDepositTokenAddress: ({ multicall, contract, poolIndex }) =>
          multicall
            .wrap(contract)
            .poolInfo(poolIndex)
            .then(pool => pool.lpToken),
        resolveRewardTokenAddresses: ({ multicall, contract }) => multicall.wrap(contract).proton(),
        rewardRateUnit: RewardRateUnit.BLOCK,
        resolveRewardRate: this.appToolkit.helpers.masterChefDefaultRewardsPerBlockStrategy.build({
          resolvePoolAllocPoints: ({ multicall, contract, poolIndex }) =>
            multicall
              .wrap(contract)
              .poolInfo(poolIndex)
              .then(i => i.allocPoint),
          resolveTotalAllocPoints: async ({ multicall, contract /*, poolIndex */ }) => {
            return multicall.wrap(contract).totalAllocPoint();
          },
          resolveTotalRewardRate: async ({ multicall, contract /*, poolIndex */ }) => {
            return multicall.wrap(contract).protonPerBlock();
          },
        }),
        resolveLabel: ({ stakedToken, rewardTokens }) =>
          `Staked ${getLabelFromToken(stakedToken)} for ${rewardTokens.map(getLabelFromToken).join(', ')} farm`,
      },
    );

    return positions.map(position => {
      if (position.dataProps.poolIndex === 0) {
        return {
          ...position,
          displayProps: {
            ...position.displayProps,
            label: 'Protofi Farms',
          },
        };
      }
      return position;
    });
  }
}
