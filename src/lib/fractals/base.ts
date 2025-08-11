// Base fractal interface and types
import { Complex, FractalParams } from '@/types/fractal';

export interface FractalDefinition {
  id: string;
  name: string;
  description: string;
  formula: (z: Complex, c?: Complex, prev?: Complex) => Complex;
  defaultParams: Partial<FractalParams>;
  interestingLocations?: Array<{
    name: string;
    center: Complex;
    zoom: number;
    description?: string;
    params?: Partial<FractalParams>; // Allow location-specific parameters
  }>;
}

export abstract class BaseFractal {
  abstract readonly definition: FractalDefinition;
  
  compute(z: Complex, c: Complex): Complex {
    return this.definition.formula(z, c);
  }
  
  getDefaultParams(): Partial<FractalParams> {
    return this.definition.defaultParams;
  }
  
  getInterestingLocations() {
    return this.definition.interestingLocations || [];
  }
}
