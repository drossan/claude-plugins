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
  // El README de dev de website/ no es contenido del sitio: excluirlo de las páginas.
  srcExclude: ['**/README.md'],
  // ignoreDeadLinks se deja en su default (false): el build FALLA ante enlaces internos rotos.
  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Guía', link: '/guia/que-es' },
      { text: 'Skills', link: '/skills/' },
    ],
    sidebar: [
      {
        text: 'Guía',
        items: [
          { text: 'Qué es', link: '/guia/que-es' },
          { text: 'Instalación', link: '/guia/instalacion' },
          { text: 'El pipeline', link: '/guia/pipeline' },
          { text: 'Configuración', link: '/guia/configuracion' },
        ],
      },
      {
        text: 'Skills',
        items: [{ text: 'Las 10 skills', link: '/skills/' }],
      },
      {
        text: 'Opcional',
        items: [
          { text: 'github-tracking', link: '/features/github-tracking' },
          { text: 'caveman', link: '/features/caveman' },
          { text: 'SDD nativo', link: '/features/sdd' },
          { text: 'Git automation', link: '/features/git-automation' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/drossan/claude-plugins' },
    ],
  },
}))
