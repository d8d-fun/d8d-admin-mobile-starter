import { JSDOM } from 'npm:jsdom'
import React from 'react'
import {render, fireEvent, within, screen} from '@testing-library/react'
import { ThemeSettingsPage } from "../pages_settings.tsx"
import { ThemeProvider } from "../hooks_sys.tsx"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()


const dom = new JSDOM(`<body></body>`, { runScripts: "dangerously" ,  pretendToBeVisual: true });

// The script will be executed and modify the DOM:
// console.log(dom.window.document.getElementById("root").innerHTML); // 1
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const customScreen = within(document.body)

// console.log(dom.window.document.getElementById("root").innerHTML); // 1
// const div = globalThis.document.createElement("div");
// div.innerHTML = "主题设置";
// globalThis.document.getElementById("root")?.appendChild(div);

// render(<TestNode />);

// const testMessage = 'Test Message'
// render(<HiddenMessage>{testMessage}</HiddenMessage>)
// console.log('document.body.innerHTML', document.body.innerHTML);
// const customScreen = within(document.body)

// screen.debug()

// // // query* functions will return the element or null if it cannot be found
// // // get* functions will return the element or throw an error if it cannot be found
// console.log('queryByText', customScreen.queryByText(testMessage))

// // // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
// fireEvent.click(customScreen.getByLabelText(/show/i))

// screen.debug()

// // // .toBeInTheDocument() is an assertion that comes from jest-dom
// // // otherwise you could use .toBeDefined()
// console.log('getByText', customScreen.getByText(testMessage).innerHTML.includes(testMessage))

// // console.log(globalThis.document.body.innerHTML);
// // console.log(screen.debug());
// // screen.findByText("主题设置");

render((
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ThemeSettingsPage />
    </ThemeProvider>
  </QueryClientProvider>
))

screen.debug()

// screen.findByText("主题设置")

