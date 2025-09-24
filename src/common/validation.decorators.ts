import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsUrl, IsPhoneNumber, IsOptional, ValidationOptions, registerDecorator, ValidationArguments } from 'class-validator';
import { SanitizationService } from './sanitization.service';

const sanitizationService = new SanitizationService();

// Custom validation decorators

/**
 * Sanitizes and validates text input
 */
export function IsSanitizedString(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeText(value))(object, propertyName);
    IsString(validationOptions)(object, propertyName);
  };
}

/**
 * Sanitizes and validates HTML input
 */
export function IsSanitizedHtml(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeHtml(value))(object, propertyName);
    IsString(validationOptions)(object, propertyName);
  };
}

/**
 * Sanitizes and validates email input
 */
export function IsSanitizedEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeEmail(value))(object, propertyName);
    IsEmail({}, validationOptions)(object, propertyName);
  };
}

/**
 * Sanitizes and validates URL input
 */
export function IsSanitizedUrl(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeUrl(value))(object, propertyName);
    IsUrl({ protocols: ['http', 'https'] }, validationOptions)(object, propertyName);
  };
}

/**
 * Sanitizes and validates phone number input
 */
export function IsSanitizedPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizePhone(value))(object, propertyName);
    IsString(validationOptions)(object, propertyName);
  };
}

/**
 * Sanitizes and validates numeric input
 */
export function IsSanitizedNumber(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeNumeric(value))(object, propertyName);
  };
}

/**
 * Sanitizes and validates boolean input
 */
export function IsSanitizedBoolean(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    Transform(({ value }) => sanitizationService.sanitizeBoolean(value))(object, propertyName);
  };
}

/**
 * Validates string length with custom message
 */
export function IsStringLength(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStringLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: {
        message: `${propertyName} must be between ${min} and ${max} characters`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const [minLength, maxLength] = args.constraints;
          return value.length >= minLength && value.length <= maxLength;
        },
      },
    });
  };
}

/**
 * Validates that string contains only alphanumeric characters and specific symbols
 */
export function IsAlphanumericWithSymbols(allowedSymbols: string[] = [], validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isAlphanumericWithSymbols',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [allowedSymbols],
      options: {
        message: `${propertyName} can only contain letters, numbers${allowedSymbols.length > 0 ? ` and ${allowedSymbols.join(', ')}` : ''}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const [symbols] = args.constraints;
          const escapedSymbols = symbols.map((s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
          const regex = new RegExp(`^[a-zA-Z0-9${escapedSymbols}]*$`);
          return regex.test(value);
        },
      },
    });
  };
}

/**
 * Validates password strength
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // At least 8 characters
          if (value.length < 8) return false;

          // Contains uppercase letter
          if (!/[A-Z]/.test(value)) return false;

          // Contains lowercase letter
          if (!/[a-z]/.test(value)) return false;

          // Contains number
          if (!/\d/.test(value)) return false;

          // Contains special character
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return false;

          return true;
        },
      },
    });
  };
}

/**
 * Validates that value is one of the allowed enum values
 */
export function IsValidEnum(enumObject: any, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidEnum',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [enumObject],
      options: {
        message: `${propertyName} must be one of: ${Object.values(enumObject).join(', ')}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [enumObj] = args.constraints;
          return Object.values(enumObj).includes(value);
        },
      },
    });
  };
}

/**
 * Validates array with minimum and maximum length
 */
export function IsArrayLength(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isArrayLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: {
        message: `${propertyName} must contain between ${min} and ${max} items`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          const [minLength, maxLength] = args.constraints;
          return value.length >= minLength && value.length <= maxLength;
        },
      },
    });
  };
}

/**
 * Optional sanitized string
 */
export function IsOptionalSanitizedString(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    IsOptional()(object, propertyName);
    Transform(({ value }) => value ? sanitizationService.sanitizeText(value) : value)(object, propertyName);
    IsString({ ...validationOptions, each: false })(object, propertyName);
  };
}