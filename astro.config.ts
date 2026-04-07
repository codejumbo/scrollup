import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import sitemap from '@astrojs/sitemap';
import remarkEmoji from 'remark-emoji';

export default defineConfig({
  output: 'static',
  site: 'https://scrollup.io',
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    expressiveCode({
      themes: [
        {
          name: 'scrollup-dark',
          type: 'dark',
          colors: {
            'editor.background': '#1A1A1F',
            'editor.foreground': '#D6D6DE',
            'editorGroupHeader.tabsBackground': '#1A1A1F',
            'tab.activeBackground': '#1A1A1F',
            'activityBar.background': '#1A1A1F',
            'sideBar.background': '#1A1A1F',
          },
          tokenColors: [
            { scope: ['keyword', 'storage', 'keyword.operator'], settings: { foreground: '#C9A0DC' } },
            { scope: ['entity.name.function', 'support.function'], settings: { foreground: '#DCC9A0' } },
            { scope: ['string', 'string.quoted'], settings: { foreground: '#A0C9A0' } },
            { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5A5A66' } },
            { scope: ['variable.other.property', 'support.type.property-name', 'meta.object-literal.key'], settings: { foreground: '#A0BCD4' } },
            { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#6E6E7A' } },
            { scope: ['variable', 'variable.other'], settings: { foreground: '#D6D6DE' } },
            { scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#DCC9A0' } },
            { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: '#C9A0DC' } },
            { scope: ['entity.other.attribute-name'], settings: { foreground: '#A0BCD4' } },
            { scope: ['support.type', 'entity.name.type'], settings: { foreground: '#DCC9A0' } },
          ],
        },
      ],
      styleOverrides: {
        borderRadius: '10px',
        borderColor: 'transparent',
        codeBackground: '#1A1A1F',
        codeFontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        codeFontSize: '13.5px',
        codeLineHeight: '1.65',
        codePaddingBlock: '16px',
        codePaddingInline: '20px',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorTabBarBackground: '#1A1A1F',
          editorTabBarBorderBottomColor: '#2A2A32',
          editorActiveTabBackground: '#1A1A1F',
          editorActiveTabForeground: '#6E6E7A',
          terminalTitlebarBackground: '#1A1A1F',
          terminalTitlebarBorderBottomColor: '#2A2A32',
          terminalTitlebarForeground: '#6E6E7A',
        },
      },
    }),
    mdx({
      remarkPlugins: [remarkEmoji],
    }),
    sitemap(),
  ],
});
