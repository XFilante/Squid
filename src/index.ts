import Sqids from 'sqids'
import { shuffleString } from './shuffle_string.js'
import vine from '@vinejs/vine'
import { createHash } from 'node:crypto'
import ProcessingException from '@filante/service-kit/exception/processing_exception'
import { Secret } from '@adonisjs/core/helpers'

const defaultDictionary = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export class Squid {
  private minLength: number
  private client: Sqids

  finalMinLength: number
  prefixConnector: string
  prefixBase: string
  dictionary: string

  get prefix() {
    return `${this.prefixBase}${this.prefixConnector}`
  }

  constructor(
    secret: Secret<string>,
    params: {
      prefix: string
      minLength?: number
      prefixConnector?: string
      dictionary?: string
    }
  ) {
    this.prefixBase = params.prefix
    this.prefixConnector = params.prefixConnector ?? '_'

    this.minLength = params.minLength ?? 22

    this.dictionary = params.dictionary ?? defaultDictionary

    this.finalMinLength = this.prefix.length + this.minLength

    const seed = createHash('sha256')
      .update(this.prefix + secret.release)
      .digest('hex')

    const dictionary = shuffleString(this.dictionary, seed)

    this.client = new Sqids({
      alphabet: dictionary,
      minLength: this.minLength,
    })
  }

  encode(id: number): string {
    return `${this.prefix}${this.client.encode([id])}`
  }

  decode(uuid: string): number {
    if (uuid.length < this.finalMinLength) {
      throw new ProcessingException('Invalid UUID Length', {
        meta: {
          private: {
            uuid,
            minLength: this.finalMinLength,
            length: uuid.length,
          },
        },
      })
    }

    if (!uuid.startsWith(this.prefix)) {
      throw new ProcessingException('Invalid UUID Prefix', {
        meta: {
          private: {
            uuid,
            prefix: this.prefix,
          },
        },
      })
    }

    const id = this.client.decode(uuid.replace(new RegExp(`^${this.prefix}`), ''))[0]

    if (!id) {
      throw new ProcessingException('Invalid UUID', {
        meta: {
          private: {
            uuid,
            minLength: this.finalMinLength,
            length: uuid.length,
            prefix: this.prefix,
            response: {
              id,
            },
          },
        },
      })
    }

    return id
  }

  get schema() {
    return vine
      .string()
      .minLength(this.finalMinLength)
      .startsWith(this.prefix)
      .transform(this.decode.bind(this))
  }
}
