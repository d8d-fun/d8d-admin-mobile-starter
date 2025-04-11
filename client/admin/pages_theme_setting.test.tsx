import { JSDOM } from 'jsdom'
import React from 'react'
import {render, fireEvent, within, screen} from '@testing-library/react'
import { ThemeSettingsPage } from "./pages_theme_settings.tsx"
import { ThemeProvider } from "./hooks_sys.tsx"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertRejects,
} from "https://deno.land/std@0.217.0/assert/mod.ts";

const queryClient = new QueryClient()


const dom = new JSDOM(`<body></body>`, { 
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "http://localhost"
});

// 模拟浏览器环境
globalThis.window = dom.window;
globalThis.document = dom.window.document;

// 定义浏览器环境所需的类
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.ShadowRoot = dom.window.ShadowRoot;
globalThis.SVGElement = dom.window.SVGElement;

// 模拟 getComputedStyle
globalThis.getComputedStyle = (elt) => {
  const style = new dom.window.CSSStyleDeclaration();
  style.getPropertyValue = () => '';
  return style;
};

// 模拟matchMedia函数
globalThis.matchMedia = (query) => ({
  matches: query.includes('max-width'),
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// 模拟动画相关API
globalThis.AnimationEvent = globalThis.AnimationEvent || dom.window.Event;
globalThis.TransitionEvent = globalThis.TransitionEvent || dom.window.Event;

// 模拟requestAnimationFrame
globalThis.requestAnimationFrame = globalThis.requestAnimationFrame || ((cb) => setTimeout(cb, 0));
globalThis.cancelAnimationFrame = globalThis.cancelAnimationFrame || clearTimeout;

// 设置浏览器尺寸相关方法
window.resizeTo = (width, height) => {
  window.innerWidth = width || window.innerWidth;
  window.innerHeight = height || window.innerHeight;
  window.dispatchEvent(new Event('resize'));
};
window.scrollTo = () => {};

const customScreen = within(document.body);

// 使用异步测试处理真实API调用
Deno.test('主题设置页面测试', async (t) => {
  // 渲染组件
  const {findByRole, debug} = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeSettingsPage />
      </ThemeProvider>
    </QueryClientProvider>
  )

  // debug(await findByRole('radio', { name: /浅色模式/i }))

  // 测试1: 渲染基本元素
  await t.step('应渲染主题设置标题', async () => {
    const title = await customScreen.findByText(/主题设置/i)
    assertExists(title, '未找到主题设置标题')
  })

  // 测试2: 表单初始化状态
  await t.step('表单应正确初始化', async () => {
    // 检查主题模式选择
    const lightRadio = await customScreen.findByRole('radio', { name: /浅色模式/i })
    assertExists(lightRadio, '未找到浅色模式单选按钮')
    
    // 检查主题模式标签
    const themeModeLabel = await customScreen.findByText(/主题模式/i)
    assertExists(themeModeLabel, '未找到主题模式标签')
    
    // // 检查主题模式选择器 - Ant Design 使用 div 包裹 radio 而不是 radiogroup
    // const themeModeField = await customScreen.findByTestId('theme-mode-selector')
    // assertExists(themeModeField, '未找到主题模式选择器')
  })

  // 测试3: 配色方案选择
  await t.step('应显示配色方案选项', async () => {
    // 查找预设配色方案标签
    const colorSchemeLabel = await customScreen.findByText('预设配色方案')
    assertExists(colorSchemeLabel, '未找到预设配色方案标签')
    
    // 查找配色方案按钮
    const colorSchemeButtons = await customScreen.findAllByRole('button')
    assertNotEquals(colorSchemeButtons.length, 0, '未找到配色方案按钮')
  })
})

