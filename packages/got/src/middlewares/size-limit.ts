import got, { CancelableRequest, Request, Response } from 'got'

// Got's types are just all sorts of fucked.
// You can check what types are ACTUALLY returned by checking
// the return types of got.stream() and got.get()
type PromiseResponse = CancelableRequest<Response<unknown>>
type StreamResponse = Request

export default got.extend({
  handlers: [
    (options, next) => {
      const { downloadLimit, uploadLimit } = options.context
      const promiseOrStream = next(options)

      // A destroy function that supports both promises and streams
      const destroy = (message: string) => {
        if (options.isStream) {
          ;(promiseOrStream as StreamResponse).destroy(new Error(message))
          return
        }

        ;(promiseOrStream as PromiseResponse).cancel(message)
      }

      if (typeof downloadLimit === 'number') {
        // We have to cast it to the return type of promise return, not the stream return,
        // because the stream return doesn't have downloadProgress in its types...
        // You can literally do got.stream(url).on('downloadProgress', () => {...})
        // and the types won't work because got's types are fucking BROKEN.
        ;(promiseOrStream as PromiseResponse).on(
          'downloadProgress',
          progress => {
            if (
              progress.transferred > downloadLimit &&
              progress.percent !== 1
            ) {
              destroy(`Exceeded the download limit of ${downloadLimit} bytes`)
            }
          }
        )
      }

      if (typeof uploadLimit === 'number') {
        ;(promiseOrStream as PromiseResponse).on('uploadProgress', progress => {
          if (progress.transferred > uploadLimit && progress.percent !== 1) {
            destroy(`Exceeded the upload limit of ${uploadLimit} bytes`)
          }
        })
      }

      return promiseOrStream
    }
  ]
})
