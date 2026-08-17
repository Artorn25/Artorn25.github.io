import { useMemo } from 'react'
import { useMediaQuery } from './useMediaQuery'

export type DeviceCapability = 'low' | 'medium' | 'high'

function readCapability(isMobile: boolean): DeviceCapability {
  if (typeof navigator === 'undefined' || isMobile) return 'low'

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : 4

  if (cores <= 4 || memory <= 4) return 'low'
  if (cores >= 8 && memory >= 8) return 'high'
  return 'medium'
}

export function useDeviceCapability() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return useMemo(() => {
    const capability = readCapability(isMobile)
    if (isTablet && capability === 'high') return 'medium'
    return capability
  }, [isMobile, isTablet])
}
