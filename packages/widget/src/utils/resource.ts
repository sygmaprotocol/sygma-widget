import type { EvmResource, Resource } from '@buildwithsygma/sygma-sdk-core';

export function isEvmResource(resource: Resource): resource is EvmResource {
  return (resource as EvmResource).address !== undefined;
}
