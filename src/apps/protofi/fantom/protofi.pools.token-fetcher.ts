import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { UniswapPair, UniswapV2PoolTokenHelper } from '~apps/uniswap-v2';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { AppTokenPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { ProtofiContractFactory, ProtofiFactory, ProtofiLp } from '../contracts';
import { PROTOFI_DEFINITION } from '../protofi.definition';
import { ProtoFiPoolAddressCacheManager } from './protofi.pool.cache-manager';

const appId = PROTOFI_DEFINITION.id;
const groupId = PROTOFI_DEFINITION.groups.pools.id;
const network = Network.FANTOM_OPERA_MAINNET;

@Register.TokenPositionFetcher({ appId, groupId, network })
export class FantomProtofiPoolsTokenFetcher implements PositionFetcher<AppTokenPosition> {
  constructor(
    @Inject(UniswapV2PoolTokenHelper)
    private readonly poolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(ProtoFiPoolAddressCacheManager)
    private readonly protoFiPoolAddressCacheManager: ProtoFiPoolAddressCacheManager,
    @Inject(ProtofiContractFactory) private readonly protofiContractFactory: ProtofiContractFactory,
  ) {}

  async getPositions() {
    return await this.poolTokenHelper.getTokens<ProtofiFactory, ProtofiLp>({
      network,
      appId,
      groupId,
      minLiquidity: 0,
      fee: 0.003,
      factoryAddress: '0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76',
      resolveFactoryContract: opts => this.protofiContractFactory.protofiFactory(opts),
      resolvePoolContract: opts => this.protofiContractFactory.protofiLp(opts),
      resolvePoolTokenAddresses: () => this.protoFiPoolAddressCacheManager.getPoolAddresses(),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) => multicall.wrap(poolContract).symbol(),
      resolvePoolTokenSupply: ({ multicall, poolContract }) => multicall.wrap(poolContract).totalSupply(),
      resolvePoolReserves: async ({ multicall, poolContract }) => {
        const reserves = await multicall.wrap(poolContract).getReserves();
        return [reserves[0], reserves[1]];
      },
      resolvePoolUnderlyingTokenAddresses: async ({ multicall, poolContract }) => {
        return Promise.all([multicall.wrap(poolContract).token0(), multicall.wrap(poolContract).token1()]);
      },
    });
  }
}
