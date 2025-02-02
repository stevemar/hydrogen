import {
  // @ts-ignore
  renderToPipeableStream as _ssrRenderToPipeableStream, // Only available in Node context
  // @ts-ignore
  renderToReadableStream as _ssrRenderToReadableStream, // Only available in Browser/Worker context
} from 'react-dom/server';
// @ts-ignore
import {renderToReadableStream as _rscRenderToReadableStream} from '@shopify/hydrogen/vendor/react-server-dom-vite/writer.browser.server';
// @ts-ignore
import {createFromReadableStream as _createFromReadableStream} from '@shopify/hydrogen/vendor/react-server-dom-vite';

export const rscRenderToReadableStream = _rscRenderToReadableStream as (
  App: JSX.Element
) => ReadableStream<Uint8Array>;

export const createFromReadableStream = _createFromReadableStream as (
  rs: ReadableStream<Uint8Array>
) => {
  readRoot: () => JSX.Element;
};

export const ssrRenderToPipeableStream = _ssrRenderToPipeableStream;
export const ssrRenderToReadableStream = _ssrRenderToReadableStream as (
  App: JSX.Element,
  options: {
    nonce?: string;
    onCompleteShell?: () => void;
    onCompleteAll?: () => void;
    onError?: (error: Error) => void;
  }
) => ReadableStream<Uint8Array>;
