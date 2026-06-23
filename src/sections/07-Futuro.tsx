import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 6 (#futuro): proyecta el caso Cumbres más allá de los métodos
 * clásicos. Recoge cuatro líneas emergentes (ML/LSTM, BMS en tiempo real,
 * cargas de IA/GPU y sostenibilidad) sin abandonar el rigor académico.
 */
export function Futuro() {
  return (
    <SectionAnchor id="futuro" accent="futuro">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-futuro">
          Capítulo 6
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Perspectivas Futuras
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Los métodos numéricos clásicos siguen siendo la primera línea de
        análisis, pero el campo evoluciona con rapidez. Una primera frontera la
        constituyen los modelos de aprendizaje profundo, en particular las
        redes LSTM, capaces de capturar dependencias temporales largas y
        patrones no lineales que escapan a la regresión polinómica (Hong y
        Fan, 2016). Su limitación práctica es la necesidad de meses de datos
        históricos y de poder de cómputo significativo durante el
        entrenamiento.
      </p>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Una segunda frontera es la integración del modelo en sistemas BMS
        (Building Management Systems) capaces de actuar en tiempo real sobre
        chillers, UPS y bancos de baterías. El ajuste numérico deja de ser un
        informe semanal para convertirse en una señal de control que se
        actualiza con cada nueva muestra (ASHRAE, 2021).
      </p>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La tercera tendencia es la irrupción de cargas asociadas a inteligencia
        artificial. Los racks especializados para entrenamiento de modelos
        grandes superan los 40 kW por rack, frente a los 8 kW típicos de un
        rack de cómputo general (Uptime Institute, 2024). Este salto modifica
        radicalmente la curva de carga y exige métodos adaptativos que detecten
        cambios de régimen.
      </p>

      <p className="text-base leading-relaxed text-slate-700">
        Por último, la sostenibilidad introduce restricciones nuevas: huella de
        carbono, integración con energías renovables intermitentes y reuso del
        calor residual. La predicción de demanda se convierte en una pieza del
        problema más amplio de planeación energética con criterios
        ambientales, alineado con las metas de descarbonización del sector
        (Koomey, 2011).
      </p>
    </SectionAnchor>
  );
}

export default Futuro;
