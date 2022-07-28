import { Register } from '~app-toolkit/decorators';
import { AbstractApp } from '~app/app.dynamic-module';

import { ProtofiContractFactory } from './contracts';
import { ProtofiAppDefinition, PROTOFI_DEFINITION } from './protofi.definition';

@Register.AppModule({
  appId: PROTOFI_DEFINITION.id,
  providers: [ProtofiAppDefinition, ProtofiContractFactory],
})
export class ProtofiAppModule extends AbstractApp() {}
