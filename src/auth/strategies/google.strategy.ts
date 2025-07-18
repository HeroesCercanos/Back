import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptions, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private userService: UserService) {
    super({
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      scope:        ['openid', 'email', 'profile'],
      prompt:       'select_account',    // fuerza selector de cuenta
      accessType:   'offline',           // para refresh tokens
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // Extrae datos de forma segura
    const email = Array.isArray(profile.emails) && profile.emails.length
      ? profile.emails[0].value
      : profile._json?.email;
    const name = profile.name?.givenName || profile.displayName;
    const picture = Array.isArray(profile.photos) && profile.photos.length
      ? profile.photos[0].value
      : profile._json?.picture;

    if (!email) {
      return done(new Error('No se obtuvo el email de Google'), false);
    }

    // 1) Busca al usuario por googleId o por email
    let user = await this.userService.findByGoogleId(profile.id);
    if (!user) {
      user = await this.userService.findByEmail(email);
    }

    // 2) Crea o asocia
    if (!user) {
      user = await this.userService.create({
        email,
        name,
        picture,
        googleId: profile.id,
      });
    } else if (!user.googleId) {
      user = await this.userService.update(user.id, {
        googleId: profile.id,
        picture,
      });
    }

    // 3) Pasa el usuario a tu callback para generar token, cookie, etc.
    done(null, user);
  }
}
