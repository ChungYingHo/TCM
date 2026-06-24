export function isNavActive(path: string, href: string): boolean {
  if (href === '/home') return path === '/home' || path === '/review'
  if (href === '/study') return path === '/study' || path === '/exam' || path === '/wrongbook'
  if (href === '/vocab') return path === '/vocab' || path === '/classics'
  if (href === '/notes') return path === '/notes' || path.startsWith('/periodic-table') || path.startsWith('/amino-acids') || path.startsWith('/readings')
  return path === href || path.startsWith(href + '/')
}
