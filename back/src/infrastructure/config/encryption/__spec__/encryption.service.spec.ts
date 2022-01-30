import { repeat } from 'lodash';
import { EnvironmentConfigService } from '../../environment-config/environment-config.service';
import { EncryptionService } from '../encryption.service';

describe('infrastructure/config/encryption/EncryptionService', () => {
  let encryptionService: EncryptionService;
  let mockEnvironmentConfigService: EnvironmentConfigService;

  beforeEach(() => {
    mockEnvironmentConfigService = {} as EnvironmentConfigService;
    mockEnvironmentConfigService.get = jest.fn();
    (mockEnvironmentConfigService.get as jest.Mock).mockReturnValue(repeat('x', 32));

    encryptionService = new EncryptionService(mockEnvironmentConfigService);
  });

  describe('onModuleInit()', () => {
    it('should init encryption key using value from config', async () => {
      // when
      await encryptionService.onModuleInit();

      // then
      expect(mockEnvironmentConfigService.get).toHaveBeenCalledWith('APP_PERSONAL_DATA_ENCRYPTION_KEY');
    });

    it('should init encryption key', async () => {
      // when
      await encryptionService.onModuleInit();

      // then
      expect(encryptionService.encryptionKey).toMatchObject({
        '0': 129,
        '1': 37,
        '2': 189,
        '3': 129,
        '4': 55,
        '5': 14,
        '6': 98,
        '7': 96,
        '8': 218,
        '9': 208,
        '10': 125,
        '11': 171,
        '12': 26,
        '13': 0,
        '14': 89,
        '15': 62,
        '16': 96,
        '17': 228,
        '18': 88,
        '19': 75,
        '20': 137,
        '21': 135,
        '22': 98,
        '23': 179,
        '24': 27,
        '25': 221,
        '26': 227,
        '27': 107,
        '28': 134,
        '29': 110,
        '30': 62,
        '31': 233,
      });
    });
  });

  describe('encrypt()', () => {
    it('should return a string containing a 16 bytes random initialization vector before the separator', async () => {
      // given
      await encryptionService.onModuleInit();

      // when
      const result: string = await encryptionService.encrypt('a secret value to encrypt');

      // then
      expect(result.substring(0, result.indexOf('___'))).toHaveLength(24);
    });

    it('should return a string containing the encrypted value after the separator', async () => {
      // given
      await encryptionService.onModuleInit();

      // when
      const result: string = await encryptionService.encrypt('a secret value to encrypt');

      // then
      expect(result.substring(result.indexOf('___') + 3)).toHaveLength(36);
    });
  });

  describe('decrypt()', () => {
    it('should return the value decrypted using the initialization vector separated with the encrypted value', async () => {
      // given
      await encryptionService.onModuleInit();
      const initializationVector: string = '1IkclDesAoq296SWPL55Vg==';
      const encryptedValue: string = 'aRMInGWXXs1LdxEK8t8vJSLnpMssZWOKbg==';
      const valueToDecrypt: string = `${initializationVector}___${encryptedValue}`;

      // when
      const result: string = await encryptionService.decrypt(valueToDecrypt);

      // then
      expect(result).toBe('a secret value to encrypt');
    });
  });
});
