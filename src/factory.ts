import { Secret } from '@adonisjs/core/helpers'
import { Squid } from './index.js'

export class SquidFactory {
  private secret: Secret<string>

  constructor(secret: Secret<string>) {
    this.secret = secret
  }

  create(params: {
    prefix: string
    minLength?: number
    prefixConnector?: string
    dictionary?: string
  }) {
    return new Squid(this.secret, params)
  }
}
