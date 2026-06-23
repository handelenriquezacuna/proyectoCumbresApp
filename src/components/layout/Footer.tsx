export interface FooterProps {
  year?: number;
  repoSlug?: string;
}

export function Footer({
  year = 2026,
  repoSlug = 'handelenriquezacuna/proyectoCumbresApp',
}: FooterProps) {
  const repoUrl = `https://github.com/${repoSlug}`;
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 sm:text-sm">
      <div className="mx-auto max-w-6xl px-4">
        <p>
          Universidad Fidélitas · Grupo 3 · {year} ·{' '}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {repoSlug}
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
