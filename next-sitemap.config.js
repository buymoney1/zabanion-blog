/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://zabanion.ir',
    generateRobotsTxt: true,
    sitemapSize: 5000,
    changefreq: 'daily',
    priority: 0.7,
    exclude: ['/admin/*', '/api/*'],
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api'],
        },
      ],
      additionalSitemaps: [
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zabanion.ir'}/blog-sitemap.xml`,
      ],
    },
    transform: async (config, path) => {
      // Custom priority for different pages
      if (path === '/') {
        return {
          loc: path,
          changefreq: 'daily',
          priority: 1.0,
          lastmod: new Date().toISOString(),
        }
      }
      if (path.startsWith('/blog/')) {
        return {
          loc: path,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date().toISOString(),
        }
      }
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
      }
    },
  }