import { defineConfig } from 'vitepress'

// Config del portal de documentación de task-pipeline.
// srcDir = raíz de este proyecto (website/): VitePress solo escanea website/**,
// nunca los .md del repo (docs/guides, .claude/**, README de raíz).
export default defineConfig({
  lang: 'es-ES',
  title: 'task-pipeline',
  description:
    'Pipeline de trabajo guiado para Claude Code: plan → grilling → design-review → tareas Gherkin → TDD → mutation → fact-checker.',
  // project-site de GitHub Pages: el sitio vive en drossan.github.io/claude-plugins/.
  // OJO (footgun): base está atado al nombre del repo; un rename/fork/dominio custom lo rompe.
  base: '/claude-plugins/',
  lastUpdated: true,
  // El README de dev de website/ no es contenido del sitio: excluirlo de las páginas.
  srcExclude: ['**/README.md'],
  // ignoreDeadLinks se deja en su default (false): el build FALLA ante enlaces internos rotos.
  themeConfig: {
    nav: [{ text: 'Inicio', link: '/' }],
    sidebar: [
      {
        text: 'task-pipeline',
        items: [{ text: 'Inicio', link: '/' }],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/drossan/claude-plugins' },
    ],
    docFooter: { prev: false, next: false },
  },
})
