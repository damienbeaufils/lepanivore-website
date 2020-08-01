import { Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isEmpty } from 'lodash';
import { ANONYMOUS } from '../../../domain/user/user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  static PUBLIC_METADATA_KEY: string = 'isPublic';

  constructor(private readonly reflector: Reflector) {
    super();
  }

  // tslint:disable-next-line:no-any
  handleRequest<TUser = any>(err: any, user: any, info: any, context: any, status?: any): TUser {
    const isPublic: boolean = this.reflector.get<boolean>(JwtAuthGuard.PUBLIC_METADATA_KEY, context.getHandler());
    if (isPublic && isEmpty(user)) {
      // @ts-ignore
      return ANONYMOUS;
    }

    return super.handleRequest(err, user, info, context, status);
  }
}

// tslint:disable-next-line:variable-name
export const Public = () => SetMetadata(JwtAuthGuard.PUBLIC_METADATA_KEY, true);
