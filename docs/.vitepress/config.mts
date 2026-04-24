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
      { text: 'JavaScript', link: '/javascript/' },
      { text: 'TypeScript', link: '/typescript/' },
      { text: 'React', link: '/react/' },
      { text: 'Web', link: '/web/' },
      { text: 'Code Quality', link: '/code-quality/' },
    ],

    sidebar: {
      '/javascript/': [
        {
          text: 'JavaScript',
          items: [
            { text: '개요', link: '/javascript/' },
            { text: '스코프를 좁혀서 작성하기', link: '/javascript/closure' },
            { text: '비동기 코드를 명확하게 작성하기', link: '/javascript/async-patterns' },
          ],
        },
      ],
      '/typescript/': [
        {
          text: 'TypeScript',
          items: [
            { text: '개요', link: '/typescript/' },
            { text: '타입을 좁혀서 안전하게 사용하기', link: '/typescript/type-narrowing' },
            { text: '재사용 가능한 타입 설계하기', link: '/typescript/generics' },
          ],
        },
      ],
      '/react/': [
        {
          text: 'React',
          items: [
            { text: '개요', link: '/react/' },
            { text: '단일 책임 컴포넌트 작성하기', link: '/react/component-design' },
            { text: '상태를 적절한 위치에 배치하기', link: '/react/state-management' },
          ],
        },
      ],
      '/web/': [
        {
          text: 'Web',
          items: [
            { text: '개요', link: '/web/' },
            { text: '렌더링 성능을 고려한 코드 작성하기', link: '/web/browser-rendering' },
            { text: '리소스 로딩을 최적화하기', link: '/web/performance' },
          ],
        },
      ],
      '/code-quality/': [
        {
          text: 'Code Quality',
          items: [
            { text: '개요', link: '/code-quality/' },
            { text: '가독성 높은 코드 작성하기', link: '/code-quality/readability' },
            { text: '예측 가능한 코드 작성하기', link: '/code-quality/predictability' },
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
