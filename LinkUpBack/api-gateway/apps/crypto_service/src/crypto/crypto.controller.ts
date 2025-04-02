import { Controller, Logger } from '@nestjs/common';
import { CryptoServices } from './crypto.service';
import { 
  CryptoServiceController,
   CryptoServiceControllerMethods, DecryptRequest, DecryptResponse, DeterministicEncryptRequest, DeterministicEncryptResponse, EncryptRequest, EncryptResponse, HashRequest, HashResponse, VerifyRequest, VerifyResponse } from '@app/common';
import { Observable } from 'rxjs';


@Controller()
@CryptoServiceControllerMethods()
export class CryptoController implements CryptoServiceController {
  private readonly logger = new Logger(CryptoController.name);

  constructor(private readonly cryptoServices: CryptoServices) {};

  async encrypt(request: EncryptRequest): Promise<EncryptResponse> 
  {
    this.logger.log(`Received encrypt request: ${JSON.stringify(request)}`);
    return this.cryptoServices.encrypt(request); 
  }
  decrypt(request: DecryptRequest): Promise<DecryptResponse> | Observable<DecryptResponse> | DecryptResponse {
    this.logger.log(`Received decrypt request: ${JSON.stringify(request)}`);
    return this.cryptoServices.decrypt(request); 
  }
  deterministeEncrypt(request: DeterministicEncryptRequest): Promise<DeterministicEncryptResponse> | Observable<DeterministicEncryptResponse> | DeterministicEncryptResponse {
    this.logger.log(`Received deterministic encrypt request: ${JSON.stringify(request)}`);
    return this.cryptoServices.deterministeEncrypt(request); 
  }
  hash(request: HashRequest): Promise<HashResponse> | Observable<HashResponse> | HashResponse {
    this.logger.log(`Received hash request: ${JSON.stringify(request)}`);
    return this.cryptoServices.hash(request); 
  }
  verify(request: VerifyRequest): Promise<VerifyResponse> | Observable<VerifyResponse> | VerifyResponse {
    this.logger.log(`Received verify request: ${JSON.stringify(request)}`);
    return this.cryptoServices.verify(request); 
  }


  
}
