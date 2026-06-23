import { SectionAnchor } from '@/components/layout/SectionAnchor';

/**
 * Sección 7 (#conclusiones): cierre del informe con tres conclusiones
 * formales sobre la pertinencia de cada método, el impacto económico y las
 * recomendaciones técnicas para Cumbres Data Center S.A.
 */
export function Conclusiones() {
  return (
    <SectionAnchor id="conclusiones" accent="conclusiones">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cumbres-conclusiones">
          Capítulo 7
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Conclusiones
        </h2>
      </header>

      <p className="mb-6 text-base leading-relaxed text-slate-700">
        El análisis comparativo aplicado al perfil horario del Cumbres Data
        Center permite extraer tres conclusiones operativas, alineadas con la
        literatura de referencia y útiles tanto para la gestión diaria como
        para la toma de decisiones de inversión.
      </p>

      <ol className="space-y-5">
        <li className="rounded-md border-l-4 border-cumbres-conclusiones bg-amber-50/50 p-4">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-900">
            Conclusión 1 — Método según contexto
          </p>
          <p className="text-base leading-relaxed text-slate-700">
            La regresión polinómica por mínimos cuadrados de grado bajo
            (entre 3 y 5) es la opción más equilibrada para la predicción
            horaria del Cumbres Data Center: ofrece un MAPE inferior a 2 % sin
            las oscilaciones que afectan a la interpolación pura. Newton y
            Lagrange resultan adecuados únicamente cuando se requiere paso
            exacto por los datos en submallas pequeñas, por ejemplo para
            interpolar entre dos lecturas SCADA contiguas (Chapra y Canale,
            2015).
          </p>
        </li>

        <li className="rounded-md border-l-4 border-cumbres-conclusiones bg-amber-50/50 p-4">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-900">
            Conclusión 2 — Impacto económico
          </p>
          <p className="text-base leading-relaxed text-slate-700">
            Anticipar el pico de las 13:00–14:00 con una hora de antelación
            permite activar protocolos de demanda interrumpible y desplazar
            cargas TI no críticas hacia los bloques tarifarios valle y
            nocturno. Sobre la tarifa T-MT costarricense, esta práctica
            reduce el cargo por demanda máxima en aproximadamente un 8 % a
            12 %, con un retorno de inversión sobre el modelado numérico
            inferior a un año fiscal (Koomey, 2011; Uptime Institute, 2024).
          </p>
        </li>

        <li className="rounded-md border-l-4 border-cumbres-conclusiones bg-amber-50/50 p-4">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-900">
            Conclusión 3 — Recomendaciones técnicas
          </p>
          <p className="text-base leading-relaxed text-slate-700">
            Se recomienda institucionalizar un proceso semanal de reajuste del
            polinomio de grado 5 con la serie de los últimos 7 días, validar el
            ajuste con MAPE y R² antes de su despliegue en el BMS, y
            documentar la versión del modelo y sus métricas en un registro
            auditable. La revisión trimestral debe contrastar el modelo
            numérico con un benchmark de LSTM una vez se acumulen al menos
            seis meses de datos (Hong y Fan, 2016; Mora Flores, 2022).
          </p>
        </li>
      </ol>
    </SectionAnchor>
  );
}

export default Conclusiones;
