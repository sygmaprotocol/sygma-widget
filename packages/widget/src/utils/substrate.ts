import type { ApiPromise } from '@polkadot/api';
import type { u32 } from '@polkadot/types-codec';

export async function fetchParachainId(api: ApiPromise): Promise<number> {
  // TODO: use polkadot type augmentation to remove "as 32"
  const parachainId = await api.query.parachainInfo.parachainId();
  return (parachainId as u32).toNumber();
}
