import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'

export default defineConfig({
  title: 'SIPE Frontend Principles',
  description: 'SIPE 팀의 프론트엔드 코드 작성 지침',
  lang: 'ko-KR',

  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon.png' }],
  ],

  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'SIPE Frontend Principles',

    nav: [
      { text: 'Home', link: '/' },
      { text: '컴포넌트 설계', link: '/component-design/' },
      { text: '훅 설계', link: '/custom-hooks/' },
      { text: '상태 관리', link: '/state-management/' },
      { text: '비동기/에러', link: '/async-error-handling/' },
      { text: 'Props/인터페이스', link: '/props-interface/' },
      { text: '아키텍처', link: '/architecture/' },
    ],

    sidebar: {
      '/component-design/': [
        {
          text: '컴포넌트 설계',
          items: [
            { text: '개요', link: '/component-design/' },
          ],
        },
      ],
      '/custom-hooks/': [
        {
          text: '훅 설계',
          items: [
            { text: '개요', link: '/custom-hooks/' },
          ],
        },
      ],
      '/state-management/': [
        {
          text: '상태 관리',
          items: [
            { text: '개요', link: '/state-management/' },
          ],
        },
      ],
      '/async-error-handling/': [
        {
          text: '비동기 처리와 에러 핸들링',
          items: [
            { text: '개요', link: '/async-error-handling/' },
          ],
        },
      ],
      '/props-interface/': [
        {
          text: '컴포넌트 인터페이스',
          items: [
            { text: '개요', link: '/props-interface/' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: '아키텍처와 폴더 구조',
          items: [
            { text: '개요', link: '/architecture/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sipe-team' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/sipe-team/SIPE-Frontend-Principles/edit/main/docs/:path',
      text: '이 페이지 수정하기',
    },

    lastUpdated: {
      text: '마지막 수정일',
    },

    outline: {
      label: '목차',
    },

    docFooter: {
      prev: '이전',
      next: '다음',
    },
  },
})
