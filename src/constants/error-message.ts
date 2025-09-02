interface EmailValidation {
  required: string;
  validate: string;
}

interface NameValidation {
  required: string;
  validate: string;
}

interface PasswordValidation {
  required: string;
  lowercase: string;
  uppercase: string;
  number: string;
  symbol: string;
  minimum: string;
  maximum: string;
  confirm: string;
  notMatched: string;
}

interface TextValidation {
  required: string;
  custom: string;
  minimum: string;
}

interface SsoEmailValidation {
  required: string;
  validate: string;
}

interface ErrorMessages {
  email: EmailValidation;
  name: NameValidation;
  password: PasswordValidation;
  text: TextValidation;
  ssoEmail: SsoEmailValidation;
}

export const errorMessages: ErrorMessages = {
  email: {
    required: "Please enter an email",
    validate: "Please enter valid email",
  },
  name: {
    required: "Please enter name",
    validate: "Please enter valid name",
  },
  password: {
    required: "Please enter a password",
    lowercase: "Please enter one lowercase character",
    uppercase: "Please enter one uppercase character",
    number: "Please enter one number or digit",
    symbol: "Please enter one symbol",
    minimum: "Please enter at least 8 characters long",
    maximum: "Please enter maximum 16 characters",
    confirm: "Password doesn't matched",
    notMatched: "Password doesn't matched",
  },
  text: {
    required: "This field required",
    custom: "Please enter ",
    minimum: "Please enter minimum 2 digits",
  },
  ssoEmail: {
    required: "Please enter an work email address",
    validate: "Please enter valid work email address",
  },
};
