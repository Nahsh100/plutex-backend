"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const jwks_rsa_1 = require("jwks-rsa");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        const issuer = configService.get('CLERK_ISSUER') ||
            (configService.get('CLERK_DOMAIN')
                ? `https://${configService.get('CLERK_DOMAIN')}`
                : undefined);
        const jwksUri = issuer ? `${issuer}/.well-known/jwks.json` : undefined;
        if (!issuer || !jwksUri) {
            console.warn('[JWT] Clerk issuer missing. Check CLERK_DOMAIN / CLERK_ISSUER env vars');
        }
        else {
            console.log('[JWT] Using Clerk issuer:', issuer);
            console.log('[JWT] JWKS URI:', jwksUri);
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            algorithms: ['RS256'],
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUri || '',
            }),
        });
        this.configService = configService;
    }
    async validate(payload) {
        console.log('[JWT] Token payload received:', JSON.stringify(payload, null, 2));
        if (!payload?.sub) {
            throw new common_1.UnauthorizedException('Invalid Clerk token');
        }
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role || 'CUSTOMER',
            vendorId: payload.vendorId,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map