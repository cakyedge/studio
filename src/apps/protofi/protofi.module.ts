import { Register } from '~app-toolkit/decorators';
import { AbstractApp } from '~app/app.dynamic-module';
import { UniswapV2AppModule } from '~apps/uniswap-v2';

import { ProtofiContractFactory } from './contracts';
import { ProtoFiPoolAddressCacheManager } from './fantom/protofi.pool.cache-manager';
import { FantomProtofiPoolsTokenFetcher } from './fantom/protofi.pools.token-fetcher';
import { ProtofiAppDefinition, PROTOFI_DEFINITION } from './protofi.definition';

@Register.AppModule({
  appId: PROTOFI_DEFINITION.id,
  imports: [UniswapV2AppModule],
  providers: [FantomProtofiPoolsTokenFetcher, ProtoFiPoolAddressCacheManager, ProtofiAppDefinition, ProtofiContractFactory],
})
export class ProtofiAppModule extends AbstractApp() {}
