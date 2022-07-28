import { Register } from '~app-toolkit/decorators';
import { appDefinition, AppDefinition } from '~app/app.definition';
import { AppAction, AppTag } from '~app/app.interface';
import { Network } from '~types/network.interface';

export const PROTOFI_DEFINITION = appDefinition({
  id: 'protofi',
  name: 'ProtoFi',
  description:
    'Next generation of decentralized banking and the most advanced yield farming protocol on the Fantom network',
  url: 'https://protofi.app/',
  groups: {},
  tags: [AppTag.DECENTRALIZED_EXCHANGE, AppTag.FARMING],
  keywords: [],
  links: {},

  supportedNetworks: {
    [Network.FANTOM_OPERA_MAINNET]: [AppAction.VIEW],
  },

  primaryColor: '#fff',
});

@Register.AppDefinition(PROTOFI_DEFINITION.id)
export class ProtofiAppDefinition extends AppDefinition {
  constructor() {
    super(PROTOFI_DEFINITION);
  }
}

export default PROTOFI_DEFINITION;
