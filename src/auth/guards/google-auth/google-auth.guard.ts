import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Cambiamos de 'protected' a 'public' (o 'public override' si tu TS lo permite)
  public getAuthenticateOptions(context: ExecutionContext) {
    return {
      scope:      ['openid', 'email', 'profile'],
      prompt:     'select_account',
      accessType: 'offline',
    };
  }
}
