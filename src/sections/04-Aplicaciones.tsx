import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 3 (#aplicaciones): traduce los métodos numéricos a casos concretos
 * de un data center. Pronóstico horario, optimización HVAC, gestión de la
 * tarifa T-MT y detección de picos son los cuatro escenarios desarrollados.
 */
export function Aplicaciones() {
  return (
    <SectionAnchor id="aplicaciones" accent="aplicaciones">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-aplicaciones">
          Capítulo 3
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Aplicaciones en Data Centers
        </h2>
      </header>

      <p className="mb-4 text-base leading-relaxed text-slate-700">
        Un data center es una infraestructura crítica que opera 24 horas al día
        y cuya factura eléctrica representa entre el 30 % y el 50 % del costo
        operativo total (Koomey, 2011). La aplicación de métodos numéricos a su
        gestión energética se materializa en cuatro frentes complementarios.
      </p>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Pronóstico horario de demanda
      </h3>
      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La curva de carga horaria permite anticipar picos y valles, programar
        mantenimiento preventivo y dimensionar el respaldo en UPS y generadores
        diésel. Una regresión polinómica de grado moderado capta la forma del
        día sin sobreajustar el ruido de medición de los SCADA.
      </p>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Optimización HVAC
      </h3>
      <p className="mb-4 text-base leading-relaxed text-slate-700">
        El sistema de climatización consume entre 35 % y 45 % de la energía del
        data center, y su eficiencia depende de la temperatura del aire de
        retorno y la carga TI prevista. Las directrices térmicas de ASHRAE
        (2021) recomiendan operar dentro del rango A1 (18–27 °C), y el modelo
        numérico de demanda permite ajustar los setpoints horarios con
        antelación, evitando rampas térmicas bruscas.
      </p>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Gestión tarifaria (T-MT)
      </h3>
      <p className="mb-4 text-base leading-relaxed text-slate-700">
        La tarifa Media Tensión costarricense distingue tres bloques horarios
        (punta, valle y nocturno) con precios diferenciados. Una predicción
        confiable habilita estrategias de desplazamiento de carga y reduce el
        cobro por demanda máxima registrada en cada ciclo de facturación
        (Koomey, 2011).
      </p>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Detección anticipada de picos
      </h3>
      <p className="text-base leading-relaxed text-slate-700">
        La derivada del polinomio ajustado identifica las horas con mayor
        pendiente de subida, ofreciendo una señal de alarma temprana que activa
        protocolos de demanda interrumpible (ASHRAE, 2021). Esta sinergia entre
        análisis numérico y operación cotidiana es lo que justifica la
        inversión en modelado matemático riguroso.
      </p>
    </SectionAnchor>
  );
}

export default Aplicaciones;
