import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Cave Docs',
  favicon: 'img/cave_dark.ico',

  future: {
    v4: true,
  },

  url: 'https://CA-Visualizer-for-Education.github.io',
  baseUrl: '/Clean-Architecture-Visualizer/',
  organizationName: 'CA-Visualizer-for-Education',
  projectName: 'Clean-Architecture-Visualizer',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'users',
          routeBasePath: 'users',
          sidebarPath: './sidebarsUsers.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'developers',
        path: 'developers',
        routeBasePath: 'developers',
        sidebarPath: './sidebarsDevelopers.ts',
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Cave Docs',
      logo: {
        alt: 'Cave Logo',
        src: 'img/logo_light.svg',
        srcDark: 'img/logo_dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'usersSidebar',
          position: 'left',
          label: 'Users',
        },
        {
          type: 'docSidebar',
          sidebarId: 'developersSidebar',
          docsPluginId: 'developers',
          position: 'left',
          label: 'Developers',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Paul Gries. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;