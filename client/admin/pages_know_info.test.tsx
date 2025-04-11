import { JSDOM } from 'jsdom'
import React from 'react'
import {render, fireEvent, within, screen, waitFor} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  assertEquals,
  assertExists,
  assertNotEquals,
  assertRejects,
  assert,
} from "https://deno.land/std@0.217.0/assert/mod.ts";
import axios from 'axios';
import { KnowInfoPage } from "./pages_know_info.tsx"
import { AuthProvider } from './hooks_sys.tsx'

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

localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsInNlc3Npb25JZCI6Ijk4T2lzTW5SMm0zQ0dtNmo4SVZrNyIsInJvbGVJbmZvIjpudWxsLCJpYXQiOjE3NDQzNjIzNTUsImV4cCI6MTc0NDQ0ODc1NX0.k1Ld7qWAZmdzsbjmrl_0ec1FqF_GimaOuQIic4znRtc');

axios.defaults.baseURL = 'https://23957.dev.d8dcloud.com'

const customScreen = within(document.body);

// 使用异步测试处理组件渲染
Deno.test({
  name: '知识库管理页面测试',
  fn: async (t) => {
    // 存储所有需要清理的定时器
    const timers: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    const originalSetInterval = globalThis.setInterval;

    // 重写定时器方法以跟踪所有创建的定时器
    globalThis.setTimeout = ((callback, delay, ...args) => {
      const id = originalSetTimeout(callback, delay, ...args);
      timers.push(id);
      return id;
    }) as typeof setTimeout;

    globalThis.setInterval = ((callback, delay, ...args) => {
      const id = originalSetInterval(callback, delay, ...args);
      timers.push(id);
      return id;
    }) as typeof setInterval;

    // 清理函数
    const cleanup = () => {
      for (const id of timers) {
        clearTimeout(id);
        clearInterval(id);
      }
      // 恢复原始定时器方法
      globalThis.setTimeout = originalSetTimeout;
      globalThis.setInterval = originalSetInterval;
    };

    try {
      // 渲染组件
      const {
        findByText, findByPlaceholderText, queryByText, 
        findByRole, findAllByRole, findByLabelText, findAllByText, debug
      } = render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <KnowInfoPage />
          </AuthProvider>
        </QueryClientProvider>
      );

      // 测试1: 基本渲染
      await t.step('应正确渲染页面元素', async () => {
        const title = await findByText(/知识库管理/i);
        assertExists(title, '未找到知识库管理标题');
      });

      let i = 0

      // 初始加载表格数据
      await waitFor(async () => {
        const table = await findByRole('table');
        const rows = await within(table).findAllByRole('row');

        // debug(rows[1])
        i++
        console.log('i', i)
        console.log('rows', rows.length)

        // 应该大于2行
        // assert(rows.length > 2, '表格没有数据'); // 1是表头行 2是数据行
        
        if (rows.length <= 2) {
          throw new Error('表格没有数据');
        }
      }, {
        timeout: 1000 * 10,
      });

      // 测试2: 搜索表单功能
      await t.step('搜索表单应正常工作', async () => {
        const searchInput = await findByPlaceholderText(/请输入文章标题/i) as HTMLInputElement;
        const searchButton = await findByText(/搜 索/i);
        
        // 输入搜索内容
        fireEvent.change(searchInput, { target: { value: '数据分析' } });
        assertEquals(searchInput.value, '数据分析', '搜索输入框值未更新');
        
        // 提交搜索
        fireEvent.click(searchButton);
        
        // // 验证是否触发了搜索
        // await waitFor(() => {
        //   const loading = queryByText(/正在加载数据/i);
        //   assertNotEquals(loading, null, '搜索未触发加载状态');
        // });

        // 等待搜索结果并验证
        await waitFor(async () => {
          const table = await findByRole('table');
          const rows = await within(table).findAllByRole('row');

          debug(rows)

          console.log('rows', rows.length);
          
          // 检查至少有一行包含"数据分析"
          const hasMatch = rows.some(async row => {
            const cells = await within(row).findAllByRole('cell');
            return cells.some(cell => cell.textContent?.includes('数据分析'));
          });

          console.log('hasMatch', hasMatch);
          
          assert(hasMatch, '搜索结果中没有找到包含"数据分析"的文章');
        }, {
          timeout: 5000,
          onTimeout: () => new Error('等待搜索结果超时')
        });
      });

      // 测试3: 表格数据加载
      await t.step('表格应加载并显示数据', async () => {
        // 等待数据加载完成或表格出现，最多等待5秒
        await waitFor(async () => {
          // 检查加载状态是否消失
          const loading = queryByText(/正在加载数据/i);
          if (loading) {
            throw new Error('数据仍在加载中');
          }
          
          // 检查表格是否出现
          const table = await findByRole('table');
          assertExists(table, '未找到数据表格');
          
          // 检查表格是否有数据行
          const rows = await within(table).findAllByRole('row');
          assertNotEquals(rows.length, 1, '表格没有数据行'); // 1是表头行
        }, {
          timeout: 5000, // 5秒超时
          onTimeout: (error) => {
            return new Error(`数据加载超时: ${error.message}`);
          }
        });
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

      // 测试5: 完整添加文章流程
      await t.step('应能完整添加一篇文章', async () => {
        // 打开添加模态框
        const addButton = await findByText(/添加文章/i);
        fireEvent.click(addButton);

        // 填写表单
        const titleInput = await findByLabelText(/文章标题/i) as HTMLInputElement;
        const contentInput = await findByLabelText(/文章内容/i) as HTMLTextAreaElement;
        const submitButton = await findByText(/确 定/i);

        fireEvent.change(titleInput, { target: { value: '测试文章标题' } });
        fireEvent.change(contentInput, { target: { value: '这是测试文章内容' } });

        // 验证表单字段
        assertEquals(titleInput.value, '测试文章标题', '标题输入框值未更新');
        assertEquals(contentInput.value, '这是测试文章内容', '内容输入框值未更新');
        
        // 提交表单
        fireEvent.click(submitButton);

        // // 验证提交后状态
        // await waitFor(() => {
        //   const successMessage = queryByText(/添加成功/i);
        //   assertExists(successMessage, '未显示添加成功提示');
        // });

        // // 验证模态框已关闭
        // await waitFor(() => {
        //   const modalTitle = queryByText(/添加知识库文章/i);
        //   assertEquals(modalTitle, null, '添加模态框未关闭');
        // });

        // 验证表格中是否出现新添加的文章
        await waitFor(async () => {
            const table = await findByRole('table');
            const rows = await within(table).findAllByRole('row');
            
            const hasNewArticle = rows.some(async row => {
              // 使用更通用的选择器来查找包含文本的单元格
              const cells = await within(row).findAllByRole('cell')
              return cells.some(cell => cell.textContent?.includes('测试文章标题'));
            });
            
            assert(hasNewArticle, '新添加的文章未出现在表格中');
          }, 
          // {
          //   timeout: 5000,
          //   onTimeout: () => new Error('等待新文章出现在表格中超时')
          // }
        );
      });

  // // 测试5: 分页功能
  // await t.step('应显示分页控件', async () => {
  //   const pagination = await findByRole('navigation');
  //   assertExists(pagination, '未找到分页控件');
    
  //   const pageItems = await findAllByRole('button', { name: /1|2|3|下一页|上一页/i });
  //   assertNotEquals(pageItems.length, 0, '未找到分页按钮');
  // });

  // // 测试6: 操作按钮
  // await t.step('应显示操作按钮', async () => {
  //   const editButtons = await findAllByText(/编辑/i);
  //   assertNotEquals(editButtons.length, 0, '未找到编辑按钮');
    
  //   const deleteButtons = await findAllByText(/删除/i);
  //   assertNotEquals(deleteButtons.length, 0, '未找到删除按钮');
  // });
    } finally {
      // 确保清理所有定时器
      cleanup();
    }
  },
  sanitizeOps: false, // 禁用操作清理检查
  sanitizeResources: false, // 禁用资源清理检查
});
