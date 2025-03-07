/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express'

export const logger = function (req: Request, res: Response, next?: NextFunction) {
  const start = Date.now()
  const { method, originalUrl } = req
  res.on('finish', () => {
    const { statusCode } = res
    const delay = Date.now() - start
    const loggerMessage = `${method} ${originalUrl} ${statusCode.toString()} - ${delay.toString()}ms`
    if (statusCode >= 400) {
      console.error(loggerMessage)
    } else {
      console.log(loggerMessage)
    }
  })

  if (next) {
    next()
  }
}
