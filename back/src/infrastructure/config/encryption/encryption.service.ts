import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cipher, CipherKey, createCipheriv, createDecipheriv, Decipher, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly ENCRYPTION_ALGORITHM: string = 'aes-256-ctr';
  private readonly ENCRYPTED_DATA_ENCODING: BufferEncoding = 'base64';
  private readonly UNENCRYPTED_DATA_ENCODING: BufferEncoding = 'utf8';
  private readonly INITIALIZATION_VECTOR_WITH_ENCRYPTED_DATA_SEPARATOR: string = '___';

  private _encryptionKey: CipherKey;

  constructor(private readonly environmentConfigService: EnvironmentConfigService) {}

  async onModuleInit(): Promise<void> {
    this._encryptionKey = (await promisify(scrypt)(this.environmentConfigService.get('APP_PERSONAL_DATA_ENCRYPTION_KEY'), 'salt', 32)) as Buffer;
  }

  async encrypt(valueToEncrypt: string): Promise<string> {
    const initializationVector: Buffer = randomBytes(16);
    const cipher: Cipher = createCipheriv(this.ENCRYPTION_ALGORITHM, this._encryptionKey, initializationVector);

    const encryptedTextBuffer: Buffer = Buffer.concat([cipher.update(Buffer.from(valueToEncrypt, this.UNENCRYPTED_DATA_ENCODING)), cipher.final()]);

    return (
      initializationVector.toString(this.ENCRYPTED_DATA_ENCODING) +
      this.INITIALIZATION_VECTOR_WITH_ENCRYPTED_DATA_SEPARATOR +
      encryptedTextBuffer.toString(this.ENCRYPTED_DATA_ENCODING)
    );
  }

  async decrypt(valueToDecrypt: string): Promise<string> {
    const splittedValueToDecrypt: string[] = valueToDecrypt.split(this.INITIALIZATION_VECTOR_WITH_ENCRYPTED_DATA_SEPARATOR);
    const initializationVector: string = splittedValueToDecrypt[0];
    const encryptedData: string = splittedValueToDecrypt[1];
    const decipher: Decipher = createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      this._encryptionKey,
      Buffer.from(initializationVector, this.ENCRYPTED_DATA_ENCODING)
    );

    const decryptedText: Buffer = Buffer.concat([decipher.update(Buffer.from(encryptedData, this.ENCRYPTED_DATA_ENCODING)), decipher.final()]);

    return decryptedText.toString(this.UNENCRYPTED_DATA_ENCODING);
  }

  get encryptionKey(): CipherKey {
    return this._encryptionKey;
  }
}
