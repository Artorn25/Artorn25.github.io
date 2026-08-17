import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { DeviceCapability } from '@hooks/useDeviceCapability'

type SceneFxProps = {
  capability: DeviceCapability
  reduced: boolean
  vignette?: boolean
}

export function SceneFx({ capability, reduced, vignette = false }: SceneFxProps) {
  if (capability !== 'high' || reduced) return null

  return (
    <EffectComposer enableNormalPass={false} multisampling={0} resolutionScale={0.6}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.22}
        luminanceSmoothing={0.32}
        intensity={0.85}
      />
      {vignette ? <Vignette eskil={false} offset={0.32} darkness={0.5} /> : null}
    </EffectComposer>
  )
}
