import { KatexEquation } from '@/components/math/KatexEquation';
import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 1 (#conceptos): introduce el vocabulario mínimo del informe.
 * Distingue demanda instantánea (kW) y energía acumulada (kWh), explica la
 * diferencia entre observaciones discretas y modelos continuos, y argumenta
 * por qué la predicción de demanda es relevante para la ingeniería eléctrica
 * en data centers.
 */
export function Conceptos() {
  return (
    <SectionAnchor id="conceptos" accent="conceptos">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-conceptos">
          Capítulo 1
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Conceptos Fundamentales
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La demanda eléctrica es la potencia activa requerida por una instalación
        en un instante dado, y constituye el insumo central de cualquier
        ejercicio de planeación energética. En términos estrictos, se define
        como la derivada temporal de la energía consumida, de modo que sus
        unidades son el kilovatio (kW) y no el kilovatio-hora (kWh), unidad que
        corresponde a la integral de la demanda sobre un intervalo (Suganthi y
        Samuel, 2012). Esta distinción es crítica porque la facturación
        comercial mezcla ambos conceptos: la energía consumida y la demanda
        máxima registrada en el período.
      </p>

      <KatexEquation
        accent="conceptos"
        latex={String.raw`D(t) = \frac{dE(t)}{dt}`}
        caption="Demanda instantánea como derivada de la energía consumida."
      />

      <KatexEquation
        accent="conceptos"
        latex={String.raw`E(t_2) - E(t_1) = \int_{t_1}^{t_2} D(\tau)\, d\tau`}
        caption="Energía consumida en un intervalo como integral de la demanda."
      />

      <p className="mb-4 mt-4 text-base leading-relaxed text-slate-700">
        En la práctica, los sistemas SCADA muestrean la potencia a intervalos
        fijos y producen series temporales discretas, mientras que los modelos
        de demanda asumen un soporte continuo. Salvar la brecha entre ambos
        mundos requiere métodos numéricos de interpolación o de regresión que
        reconstruyan, a partir de un puñado de observaciones, una función
        derivable que permita evaluar la carga en horas no medidas y proyectar
        consumos futuros (Hong y Fan, 2016).
      </p>

      <p className="text-base leading-relaxed text-slate-700">
        La importancia ingenieril de este ejercicio es doble. Por un lado, el
        dimensionamiento de transformadores, generadores y sistemas de
        enfriamiento depende del pico estimado de demanda; por otro, los
        contratos eléctricos en mercados como el costarricense (tarifa T-MT)
        penalizan los picos no anunciados y premian los perfiles planos
        (Suganthi y Samuel, 2012). Disponer de un modelo numérico fiable es,
        por tanto, una herramienta tanto de diseño como de operación
        económica.
      </p>
    </SectionAnchor>
  );
}

export default Conceptos;
