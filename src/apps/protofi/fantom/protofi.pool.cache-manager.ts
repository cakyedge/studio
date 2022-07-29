import { Inject, Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { compact, range, uniq } from 'lodash';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { CacheOnInterval } from '~cache/cache-on-interval.decorator';
import { Network } from '~types/network.interface';

import { ProtofiContractFactory, ProtofiFactory} from '../contracts';
import { PROTOFI_DEFINITION } from '../protofi.definition';

const network = Network.FANTOM_OPERA_MAINNET;

@Injectable()
export class ProtoFiPoolAddressCacheManager {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(ProtofiContractFactory) protected readonly contractFactory: ProtofiContractFactory,
  ) {}

  @CacheOnInterval({
    key: `studio:${PROTOFI_DEFINITION.id}:protofi-top-pool-addresses`,
    timeout: 15 * 60 * 1000,
  })
  private async getTopPoolAddresses() {
    return [];
  }

  @CacheOnInterval({
    key: `studio:${PROTOFI_DEFINITION.id}:protofi-gauge-pools`,
    timeout: 15 * 60 * 1000
  })
  async getGaugePoolAddresses() {
    const gaugeProxyContract = this.contractFactory.gaugeproxy({
        address: '0x1484Fa11a49f7683aDc1114B69FA188Ff64BAA65',
        network,
      })
    
    const gaugeLpAdresses = await gaugeProxyContract.tokens();
    return compact(gaugeLpAdresses);
  }

  @CacheOnInterval({
    key: `studio:${PROTOFI_DEFINITION.id}:protofi-pool-addresses`,
    timeout: 15 * 60 * 1000,
  })
  private async getProtofiMasterChefContractPoolAddresses() {
    const protofiMasterChefContract = this.contractFactory.masterchefV1({
      address: '0xa71f52aee8311c22b6329EF7715A5B8aBF1c6588',
      network,
    });

    const provider = this.appToolkit.getNetworkProvider(network);
    const multicall = this.appToolkit.getMulticall(network);
    const numPools = await multicall.wrap(protofiMasterChefContract).poolLength();
    const v1PoolsIds = [0, 1, 2, 3, 6, 15, 19]
    const allAddresses = await Promise.all(
      range(0, Number(numPools)).map(async v => {
        if (!v1PoolsIds.includes(v)) return false;
        const poolInfo = await multicall.wrap(protofiMasterChefContract).poolInfo(v);
        const lpTokenAddress = poolInfo.lpToken.toLowerCase();
        const lpTokenContract = this.contractFactory.protofiLp({ address: lpTokenAddress, network });

        // Some EOAs exist on the MasterChef contract; calling these breaks multicall
        const code = await provider.getCode(lpTokenAddress);
        if (code === '0x') return false;

        const symbol = await multicall
          .wrap(lpTokenContract)
          .symbol()
          .catch(_err => '');

        const isProtoLp = symbol === 'Proto-LP';
        if (!isProtoLp) return null;

        return lpTokenAddress;
      }),
    );

    return compact(allAddresses);
  }

  private async getStaticPoolAddresses() {
    return [];
  }

  async getPoolAddresses(): Promise<string[]> {
    const [topPoolAddresses, protofiPoolAddresses, gaugePoolAddresses, staticPoolAddresses] = await Promise.all(
      [
        this.getTopPoolAddresses(),
        this.getProtofiMasterChefContractPoolAddresses(),
        this.getGaugePoolAddresses(),
        this.getStaticPoolAddresses(),
      ],
    );

    return uniq([...topPoolAddresses, ...protofiPoolAddresses, ...gaugePoolAddresses, ...staticPoolAddresses]);
  }
}
