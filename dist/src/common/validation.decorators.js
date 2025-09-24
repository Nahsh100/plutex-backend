"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSanitizedString = IsSanitizedString;
exports.IsSanitizedHtml = IsSanitizedHtml;
exports.IsSanitizedEmail = IsSanitizedEmail;
exports.IsSanitizedUrl = IsSanitizedUrl;
exports.IsSanitizedPhone = IsSanitizedPhone;
exports.IsSanitizedNumber = IsSanitizedNumber;
exports.IsSanitizedBoolean = IsSanitizedBoolean;
exports.IsStringLength = IsStringLength;
exports.IsAlphanumericWithSymbols = IsAlphanumericWithSymbols;
exports.IsStrongPassword = IsStrongPassword;
exports.IsValidEnum = IsValidEnum;
exports.IsArrayLength = IsArrayLength;
exports.IsOptionalSanitizedString = IsOptionalSanitizedString;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const sanitization_service_1 = require("./sanitization.service");
const sanitizationService = new sanitization_service_1.SanitizationService();
function IsSanitizedString(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeText(value))(object, propertyName);
        (0, class_validator_1.IsString)(validationOptions)(object, propertyName);
    };
}
function IsSanitizedHtml(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeHtml(value))(object, propertyName);
        (0, class_validator_1.IsString)(validationOptions)(object, propertyName);
    };
}
function IsSanitizedEmail(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeEmail(value))(object, propertyName);
        (0, class_validator_1.IsEmail)({}, validationOptions)(object, propertyName);
    };
}
function IsSanitizedUrl(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeUrl(value))(object, propertyName);
        (0, class_validator_1.IsUrl)({ protocols: ['http', 'https'] }, validationOptions)(object, propertyName);
    };
}
function IsSanitizedPhone(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizePhone(value))(object, propertyName);
        (0, class_validator_1.IsString)(validationOptions)(object, propertyName);
    };
}
function IsSanitizedNumber(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeNumeric(value))(object, propertyName);
    };
}
function IsSanitizedBoolean(validationOptions) {
    return function (object, propertyName) {
        (0, class_transformer_1.Transform)(({ value }) => sanitizationService.sanitizeBoolean(value))(object, propertyName);
    };
}
function IsStringLength(min, max, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isStringLength',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [min, max],
            options: {
                message: `${propertyName} must be between ${min} and ${max} characters`,
                ...validationOptions,
            },
            validator: {
                validate(value, args) {
                    if (typeof value !== 'string')
                        return false;
                    const [minLength, maxLength] = args.constraints;
                    return value.length >= minLength && value.length <= maxLength;
                },
            },
        });
    };
}
function IsAlphanumericWithSymbols(allowedSymbols = [], validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isAlphanumericWithSymbols',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [allowedSymbols],
            options: {
                message: `${propertyName} can only contain letters, numbers${allowedSymbols.length > 0 ? ` and ${allowedSymbols.join(', ')}` : ''}`,
                ...validationOptions,
            },
            validator: {
                validate(value, args) {
                    if (typeof value !== 'string')
                        return false;
                    const [symbols] = args.constraints;
                    const escapedSymbols = symbols.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
                    const regex = new RegExp(`^[a-zA-Z0-9${escapedSymbols}]*$`);
                    return regex.test(value);
                },
            },
        });
    };
}
function IsStrongPassword(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
                ...validationOptions,
            },
            validator: {
                validate(value) {
                    if (typeof value !== 'string')
                        return false;
                    if (value.length < 8)
                        return false;
                    if (!/[A-Z]/.test(value))
                        return false;
                    if (!/[a-z]/.test(value))
                        return false;
                    if (!/\d/.test(value))
                        return false;
                    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
                        return false;
                    return true;
                },
            },
        });
    };
}
function IsValidEnum(enumObject, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isValidEnum',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [enumObject],
            options: {
                message: `${propertyName} must be one of: ${Object.values(enumObject).join(', ')}`,
                ...validationOptions,
            },
            validator: {
                validate(value, args) {
                    const [enumObj] = args.constraints;
                    return Object.values(enumObj).includes(value);
                },
            },
        });
    };
}
function IsArrayLength(min, max, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isArrayLength',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [min, max],
            options: {
                message: `${propertyName} must contain between ${min} and ${max} items`,
                ...validationOptions,
            },
            validator: {
                validate(value, args) {
                    if (!Array.isArray(value))
                        return false;
                    const [minLength, maxLength] = args.constraints;
                    return value.length >= minLength && value.length <= maxLength;
                },
            },
        });
    };
}
function IsOptionalSanitizedString(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.IsOptional)()(object, propertyName);
        (0, class_transformer_1.Transform)(({ value }) => value ? sanitizationService.sanitizeText(value) : value)(object, propertyName);
        (0, class_validator_1.IsString)({ ...validationOptions, each: false })(object, propertyName);
    };
}
//# sourceMappingURL=validation.decorators.js.map