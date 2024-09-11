// src/utils/crypto

import { sm2 } from 'sm-crypto-v2'

export const encryptWithSM2 = (string: string, publicKey: string) => {
    return sm2.doEncrypt(string, publicKey, 1)
}
