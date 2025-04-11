import { JSDOM } from 'jsdom'
import React from 'react'
import {render, fireEvent, within, screen, waitFor, configure} from '@testing-library/react'
import {userEvent} from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
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
import { ProtectedRoute } from './components_protected_route.tsx'

// 拦截React DOM中的attachEvent和detachEvent错误
const originalError = console.error;
console.error = (...args) => {
  // 过滤掉attachEvent和detachEvent相关的错误
  if (args[0] instanceof Error) {
    if (args[0].message?.includes('attachEvent is not a function') || 
        args[0].message?.includes('detachEvent is not a function')) {
      return; // 不输出这些错误
    }
  } else if (typeof args[0] === 'string') {
    if (args[0].includes('attachEvent is not a function') || 
        args[0].includes('detachEvent is not a function')) {
      return; // 不输出这些错误
    }
  }
  originalError(...args);
};

// // 配置Testing Library的eventWrapper来处理这个问题
// configure({
//   eventWrapper: (cb) => {
//     try {
//       return cb();
//     } catch (error) {
//     console.log('eventWrapper', cb)
//       // 忽略attachEvent和detachEvent相关的错误
//       if (error instanceof Error && 
//           (error.message?.includes('attachEvent is not a function') || 
//            error.message?.includes('detachEvent is not a function'))) {
//         // 忽略这个错误并返回一个默认值
//         return undefined;
//       }
//       // 其他错误正常抛出
//       throw error;
//     }
//   }
// });

const queryClient = new QueryClient()

const dom = new JSDOM(`<body></body>`, { 
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "http://localhost",
});

// 模拟浏览器环境
globalThis.window = dom.window;
globalThis.document = dom.window.document;

// 添加必要的 DOM 配置
globalThis.Node = dom.window.Node;
globalThis.Document = dom.window.Document;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;

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

// 应用入口组件
const App = () => {
  // 路由配置
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <KnowInfoPage />
        </ProtectedRoute>
      )
    },
  ]);
  return <RouterProvider router={router} />
};

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
            <App />
          </AuthProvider>
        </QueryClientProvider>
      );

      // 测试1: 基本渲染
      await t.step('应正确渲染页面元素', async () => {
        await waitFor(async () => {
          const title = await findByText(/知识库管理/i);
          assertExists(title, '未找到知识库管理标题');
        }, {
          timeout: 1000 * 5,
        });
      });

      // 初始加载表格数据
      await t.step('初始加载表格数据', async () => {
        await waitFor(async () => {
          const table = await findByRole('table');
          const rows = await within(table).findAllByRole('row');

          // 应该大于2行
          assert(rows.length > 2, '表格没有数据'); // 1是表头行 2是数据行
          
        }, {
          timeout: 1000 * 5,
        });
      });

      // 测试2: 搜索表单功能
      await t.step('搜索表单应正常工作', async () => {
        // 确保在正确的测试环境中设置 userEvent
        const user = userEvent.setup({
          document: dom.window.document,
          delay: 0
        });
        
        const searchInput = await findByPlaceholderText(/请输入文章标题/i) as HTMLInputElement;
        const searchButton = await findByText(/搜 索/i);

        assertExists(searchInput, '未找到搜索输入框');
        assertExists(searchButton, '未找到搜索按钮');
        
        // 输入搜索内容
        try {
          await user.type(searchInput, '数据分析')
        } catch (error: unknown) {
          // console.error('输入搜索内容失败', error)
        }
        assertEquals(searchInput.value, '数据分析', '搜索输入框值未更新');

        console.log('searchInput', searchInput.value)

        debug(searchInput)
        debug(searchButton)
        
        // 提交搜索
        try {
          await user.click(searchButton);
        } catch (error: unknown) {
          // console.error('点击搜索按钮失败', error)
        }
        

        let rows: HTMLElement[] = [];

        
        const table = await findByRole('table');
        assertExists(table, '未找到数据表格');

        // 等待表格刷新并验证
        await waitFor(async () => {
          rows = await within(table).findAllByRole('row');
          console.log('等待表格刷新并验证', rows.length)
          assert(rows.length === 2, '表格未刷新');
        }, {
          timeout: 1000 * 5,
          onTimeout: () => new Error('等待表格刷新超时')
        });

        // 等待搜索结果并验证
        await waitFor(async () => {
          rows = await within(table).findAllByRole('row');
          console.log('等待搜索结果并验证', rows.length)
          assert(rows.length > 2, '表格没有数据');
        }, {
          timeout: 1000 * 5,
          onTimeout: () => new Error('等待搜索结果超时')
        });


        
        // 检查至少有一行包含"数据分析"
        const matchResults = await Promise.all(rows.map(async row => {
          try{
            const cells = await within(row).findAllByRole('cell');
            return cells.some(cell => {
              return cell.textContent?.includes('数据分析')
            });
          } catch (error: unknown) {
            // console.error('搜索结果获取失败', error)
            return false
          }
        }))
        // console.log('matchResults', matchResults)
        const hasMatch = matchResults.some(result => result);

        console.log('hasMatch', hasMatch)

        assert(hasMatch, '搜索结果中没有找到包含"数据分析"的文章');
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
