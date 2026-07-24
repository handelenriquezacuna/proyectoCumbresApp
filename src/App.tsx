import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { StoryBridge } from '@/components/layout/StoryBridge';
import { TocSidebar } from '@/components/layout/TocSidebar';
import { Desafio } from '@/sections/01-Desafio';
import { LosDatos } from '@/sections/02-LosDatos';
import { Probamos } from '@/sections/03-Probamos';
import { Descubrimos } from '@/sections/04-Descubrimos';
import { Decision } from '@/sections/05-Decision';
import { Experimenta } from '@/sections/06-Experimenta';
import { Anexo } from '@/sections/07-Anexo';

/**
 * Composición principal: una historia de seis capítulos (El desafío → Los
 * datos → Probamos los métodos → Lo que descubrimos → La decisión →
 * Experimenta) seguida del anexo académico. El capítulo 1 ocupa el ancho
 * completo; del capítulo 2 en adelante rige un layout de dos columnas en
 * pantallas grandes (TOC fija a la izquierda, contenido a la derecha) que
 * en móvil colapsa a una columna con barra de progreso inferior.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <Desafio />

      <div className="mx-auto max-w-7xl px-4 py-8 pb-20 lg:py-12 lg:pb-12">
        <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Navegación lateral">
            <p className="mb-2 hidden text-xs font-semibold uppercase tracking-widest text-slate-500 lg:block">
              La historia
            </p>
            <TocSidebar />
          </aside>

          <main className="min-w-0">
            <StoryBridge to="datos" label="Los datos">
              Ya sabemos qué valor necesitamos estimar. Ahora conozcamos las
              mediciones con las que contamos.
            </StoryBridge>
            <LosDatos />
            <StoryBridge to="probamos" label="Probamos los métodos">
              Con los datos en la mesa, probemos la solución más sencilla y
              veamos dónde empieza a fallar.
            </StoryBridge>
            <Probamos />
            <StoryBridge to="descubrimos" label="Lo que descubrimos">
              Newton y Lagrange funcionan con pocos puntos. ¿Qué pasa si
              usamos todos?
            </StoryBridge>
            <Descubrimos />
            <StoryBridge to="decision" label="La decisión">
              Ya vimos qué funciona y qué se rompe. Toca decidir.
            </StoryBridge>
            <Decision />
            <StoryBridge to="experimenta" label="Experimenta">
              Esta fue nuestra decisión. Ahora construye la tuya.
            </StoryBridge>
            <Experimenta />
            <StoryBridge to="anexo" label="Profundiza en el proyecto">
              La historia termina aquí, pero el respaldo académico completo —
              conceptos, ecuaciones y hoja de cálculo — te espera en el anexo.
            </StoryBridge>
            <Anexo />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
