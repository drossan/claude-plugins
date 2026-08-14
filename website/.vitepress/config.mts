import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// Config del portal de documentación de task-pipeline.
// srcDir = raíz de este proyecto (website/): VitePress solo escanea website/**,
// nunca los .md del repo (docs/guides, .claude/**, README de raíz).
// withMermaid habilita bloques ```mermaid (misma notación que los docs de GitHub).
export default withMermaid(defineConfig({
  lang: 'es-ES',
  title: 'task-pipeline',
  description:
    'Pipeline de trabajo guiado para Claude Code: plan → grilling → design-review → tareas Gherkin → TDD → mutation → fact-checker.',
  // project-site de GitHub Pages: el sitio vive en drossan.github.io/claude-plugins/.
  // OJO (footgun): base está atado al nombre del repo; un rename/fork/dominio custom lo rompe.
  base: '/claude-plugins/',
  // El href del favicon NO recibe `base` automáticamente: se prefija a mano
  // (mismo footgun que `base` — atado al nombre del repo).
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/claude-plugins/favicon.svg' }]],
  lastUpdated: true,
  // Excluidos de las páginas del sitio: el README de dev y el mapa de fuente canónica
  // (CANONICAL-SOURCES.md es documentación interna del portal, no una página pública).
  srcExclude: ['**/README.md', 'CANONICAL-SOURCES.md'],
  // ignoreDeadLinks se deja en su default (false): el build FALLA ante enlaces internos rotos.
  themeConfig: {
    // Buscador local (sin dependencias externas): indexa el contenido en build.
    search: { provider: 'local' },
    // Nav superior alineado con la IA de 5 secciones (task-pipeline-portal-redesign-01).
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Empezar', link: '/guia/que-es' },
      { text: 'Conceptos', link: '/conceptos/modelo' },
      { text: 'El pipeline', link: '/guia/pipeline' },
      { text: 'Capas opcionales', link: '/features/sdd' },
      { text: 'Referencia', link: '/guia/configuracion' },
    ],
    // Sidebar = las 5 secciones de la IA. Slugs existentes CONSERVADOS (0 redirects);
    // solo se reagrupa y se añaden páginas nuevas (Conceptos, Tu primer plan, CLI).
    sidebar: [
      {
        text: 'Empezar',
        items: [
          { text: 'Qué es', link: '/guia/que-es' },
          { text: 'Instalación', link: '/guia/instalacion' },
          { text: 'Tu primer plan', link: '/guia/tu-primer-plan' },
        ],
      },
      {
        text: 'Conceptos',
        items: [
          { text: 'El modelo', link: '/conceptos/modelo' },
          { text: 'Estados', link: '/conceptos/estados' },
          { text: 'Ramas e ids', link: '/conceptos/ramas-e-ids' },
        ],
      },
      {
        text: 'El pipeline paso a paso',
        items: [{ text: 'El pipeline', link: '/guia/pipeline' }],
      },
      {
        text: 'Capas opcionales',
        items: [
          { text: 'SDD nativo', link: '/features/sdd' },
          { text: 'Git automation', link: '/features/git-automation' },
          { text: 'GitHub tracking', link: '/features/github-tracking' },
          { text: 'Modo caveman', link: '/features/caveman' },
        ],
      },
      {
        text: 'Referencia',
        items: [
          { text: 'Configuración (task-pipeline.yml)', link: '/guia/configuracion' },
          { text: 'Las 10 skills', link: '/skills/' },
          { text: 'CLI', link: '/referencia/cli' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/drossan/claude-plugins' },
    ],
  },
}))
