import { Register } from '~app-toolkit/decorators';
import { AbstractApp } from '~app/app.dynamic-module';
import { UniswapV2AppModule } from '~apps/uniswap-v2';

import { ProtofiContractFactory } from './contracts';
import { FantomProtofiBalanceFetcher } from './fantom/protofi.balance-fetcher';
import { FantomProtofiFarmsContractPositionFetcher } from './fantom/protofi.farms.contract-position-fetcher';
import { ProtoFiPoolAddressCacheManager } from './fantom/protofi.pool.cache-manager';
import { FantomProtofiPoolsTokenFetcher } from './fantom/protofi.pools.token-fetcher';
import { ProtofiAppDefinition, PROTOFI_DEFINITION } from './protofi.definition';

@Register.AppModule({
  appId: PROTOFI_DEFINITION.id,
  imports: [UniswapV2AppModule],
  providers: [
    FantomProtofiBalanceFetcher,
    FantomProtofiFarmsContractPositionFetcher,
    FantomProtofiPoolsTokenFetcher,
    ProtoFiPoolAddressCacheManager,
    ProtofiAppDefinition,
    ProtofiContractFactory,
  ],
})
export class ProtofiAppModule extends AbstractApp() {}
