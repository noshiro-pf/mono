/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference no-default-lib="true"/>
/// <reference path="../../../utils/stdlib/dist/lib.dom.d.ts" />
/// <reference path="../../../utils/stdlib/dist/lib.esnext.d.ts" />
/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />
/// <reference path="../../../utils/global-ts-utils/esm/globals-decl.d.ts" />

import 'solid-js';
import { render } from 'solid-js/web';
import { Main } from './components';
import './index.css';
import { unregister } from './serviceWorker';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
render(Main, document.querySelector('#root') as Node);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
