import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const issuer =
      configService.get<string>('CLERK_ISSUER') ||
      (configService.get<string>('CLERK_DOMAIN')
        ? `https://${configService.get<string>('CLERK_DOMAIN')}`
        : undefined);

    const jwksUri = issuer ? `${issuer}/.well-known/jwks.json` : undefined;

    if (!issuer || !jwksUri) {
      console.warn('[JWT] Clerk issuer missing. Check CLERK_DOMAIN / CLERK_ISSUER env vars');
    } else {
      console.log('[JWT] Using Clerk issuer:', issuer);
      console.log('[JWT] JWKS URI:', jwksUri);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      // Rely on Clerk's JWKS + signature/expiration; do not enforce a specific issuer string here
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri || '',
      }),
    });
  }

  async validate(payload: any) {
    console.log('[JWT] Token payload received:', JSON.stringify(payload, null, 2));
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Clerk token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'CUSTOMER',
      vendorId: payload.vendorId,
    };
  }
}
