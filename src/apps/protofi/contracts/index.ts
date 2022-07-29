import { Injectable, Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { ContractFactory } from '~contract/contracts';
import { Network } from '~types/network.interface';

import { Gaugeproxy__factory } from './ethers';
import { MasterchefV1__factory } from './ethers';
import { Proto__factory } from './ethers';
import { ProtofiFactory__factory } from './ethers';
import { ProtofiLp__factory } from './ethers';

// eslint-disable-next-line
type ContractOpts = { address: string; network: Network };

@Injectable()
export class ProtofiContractFactory extends ContractFactory {
  constructor(@Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit) {
    super((network: Network) => appToolkit.getNetworkProvider(network));
  }

  gaugeproxy({ address, network }: ContractOpts) {
    return Gaugeproxy__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
  masterchefV1({ address, network }: ContractOpts) {
    return MasterchefV1__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
  proto({ address, network }: ContractOpts) {
    return Proto__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
  protofiFactory({ address, network }: ContractOpts) {
    return ProtofiFactory__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
  protofiLp({ address, network }: ContractOpts) {
    return ProtofiLp__factory.connect(address, this.appToolkit.getNetworkProvider(network));
  }
}

export type { Gaugeproxy } from './ethers';
export type { MasterchefV1 } from './ethers';
export type { Proto } from './ethers';
export type { ProtofiFactory } from './ethers';
export type { ProtofiLp } from './ethers';
