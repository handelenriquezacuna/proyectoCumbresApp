import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { TocSidebar } from '@/components/layout/TocSidebar';
import { Aplicaciones } from '@/sections/04-Aplicaciones';
import { CasoCumbres } from '@/sections/05-CasoCumbres';
import { Conceptos } from '@/sections/02-Conceptos';
import { Conclusiones } from '@/sections/08-Conclusiones';
import { Futuro } from '@/sections/07-Futuro';
import { Hero } from '@/sections/01-Hero';
import { Implementacion } from '@/sections/06-Implementacion';
import { Metodos } from '@/sections/03-Metodos';
import { QuizSection } from '@/sections/09-Quiz';

/**
 * Composición principal de la aplicación. El Hero ocupa el ancho completo;
 * a partir de él se establece un layout de dos columnas en pantallas medianas
 * y superiores (TOC fija a la izquierda, contenido a la derecha) que colapsa
 * a una sola columna en móviles.
 */
function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="⚡ Proyecto Cumbres"
        subtitle="Predicción de demanda eléctrica en data centers — MA-108 Métodos Numéricos"
      />

      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Navegación lateral">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Contenido
            </p>
            <TocSidebar />
          </aside>

          <main className="min-w-0">
            <Conceptos />
            <Metodos />
            <Aplicaciones />
            <CasoCumbres />
            <Implementacion />
            <Futuro />
            <Conclusiones />
            <QuizSection />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
