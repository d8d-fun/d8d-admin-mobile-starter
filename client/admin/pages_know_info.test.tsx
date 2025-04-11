import { JSDOM } from 'jsdom'
import React from 'react'
import {render, fireEvent, within, screen, waitFor} from '@testing-library/react'
import { KnowInfoPage } from "./pages_know_info.tsx"
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

// 使用异步测试处理组件渲染
Deno.test('知识库管理页面测试', async (t) => {
  // 渲染组件
  const {
    findByText, findByPlaceholderText, queryByText, 
    findByRole, findAllByRole, findByLabelText, findAllByText
  } = render(
    <QueryClientProvider client={queryClient}>
      <KnowInfoPage />
    </QueryClientProvider>
  );

  // 测试1: 基本渲染
  await t.step('应正确渲染页面元素', async () => {
    const title = await findByText(/知识库管理/i);
    assertExists(title, '未找到知识库管理标题');
  });

  // 测试2: 搜索表单功能
  await t.step('搜索表单应正常工作', async () => {
    const searchInput = await findByPlaceholderText(/请输入文章标题/i);
    const searchButton = await findByText(/搜索/i);
    
    // 输入搜索内容
    fireEvent.change(searchInput, { target: { value: '测试' } });
    assertEquals(searchInput.getAttribute('value'), '测试', '搜索输入框值未更新');
    
    // 提交搜索
    fireEvent.click(searchButton);
    
    // 验证是否触发了搜索
    await waitFor(() => {
      const loading = queryByText(/加载中/i);
      assertNotEquals(loading, null, '搜索未触发加载状态');
    });
  });

  // 测试3: 表格数据加载
  await t.step('表格应加载并显示数据', async () => {
    // 等待数据加载
    await waitFor(() => {
      const loading = queryByText(/加载中/i);
      assertEquals(loading, null, '数据加载未完成');
    });
    
    // 验证表格存在
    const table = await findByRole('table');
    assertExists(table, '未找到数据表格');
  });

  // 测试4: 添加文章功能
  await t.step('应能打开添加文章模态框', async () => {
    const addButton = await findByText(/添加文章/i);
    fireEvent.click(addButton);
    
    const modalTitle = await findByText(/添加知识库文章/i);
    assertExists(modalTitle, '未找到添加文章模态框');
    
    // 验证表单字段
    const titleInput = await findByLabelText(/文章标题/i);
    assertExists(titleInput, '未找到标题输入框');
  });

  // 测试5: 分页功能
  await t.step('应显示分页控件', async () => {
    const pagination = await findByRole('navigation');
    assertExists(pagination, '未找到分页控件');
    
    const pageItems = await findAllByRole('button', { name: /1|2|3|下一页|上一页/i });
    assertNotEquals(pageItems.length, 0, '未找到分页按钮');
  });

  // 测试6: 操作按钮
  await t.step('应显示操作按钮', async () => {
    const editButtons = await findAllByText(/编辑/i);
    assertNotEquals(editButtons.length, 0, '未找到编辑按钮');
    
    const deleteButtons = await findAllByText(/删除/i);
    assertNotEquals(deleteButtons.length, 0, '未找到删除按钮');
  });
});