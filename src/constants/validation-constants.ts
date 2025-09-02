// @audit this does not deal with quoted local-part of the email address. *No one* in their right mind would do that shit. Which means, even though "user"@gmail.com is a valid email address according to RFC 5322, we are treating it as invalid.
// @audit-ok 123@something.com is a *VALID* email address according to RFC3690 https://www.rfc-editor.org/rfc/rfc3696
// @audit-ok and yes, a domain can be *that* long. See -> https://datatracker.ietf.org/doc/html/rfc1035#section-3
// @audit-ok Single Character TLD are allowed. See -> https://datatracker.ietf.org/doc/html/rfc1123#section-2.1
export const EMAIL_REGEX: RegExp = new RegExp(
  /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z{|}~])*@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+$/
);

export const LOWER_CASE_REGEX: RegExp = new RegExp(/[a-z]/);
export const UPPER_CASE_REGEX: RegExp = new RegExp(/[A-Z]/);
export const NUMBER_REGEX: RegExp = new RegExp(/[0-9]/);
export const SYMBOL_REGEX: RegExp = new RegExp(/[!@#$%^&*()_+|*{}<>]/);
export const MINIMUM_PASSWORD_LENGTH: number = 8;
export const MAXIMUM_PASSWORD_LENGTH: number = 16;
export const MOBILE_REGEX: RegExp = new RegExp(/^[0-9\b]*$/);
export const UPI_REGEX: RegExp = new RegExp(
  /^[a-zA-Z0-9.-]{2, 256}@[a-zA-Z][a-zA-Z]{2, 64}$/
);

export const FACEBOOK_URL: RegExp = new RegExp(
  /(?:(?:http|https):\/\/)?(?:www\.)?(?:facebook\.com)\/([A-Za-z0-9-_\.]+)/im
);
export const LINKEDIN_URL: RegExp = new RegExp(
  /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile|company)\/([A-Za-z0-9-_\.]+)/im
);
export const INSTAGRAM_URL: RegExp = new RegExp(
  /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im
);

export const ESI_NUMBER: RegExp = new RegExp(
  /^(\d{2})[-–\s]?(\d{2})[-–\s]?(\d{1,6})[-–\s]?(\d{3})[-–\s]?(\d{4})$/
);
export const PF_NUMBER: RegExp = new RegExp(
  /^([A-Z]{2}\s)([A-Z]{3}\s)([0-9]{1,7}\s)([0-9]{3}\s)?([0-9]{1,7})$/
);
export const AMOUNT_REGEX: RegExp = new RegExp(/^\d+(\.\d{1,2})?$/);

export const ALPHA_NUMERIC_SPACE_REGEX: RegExp = new RegExp(/^[a-zA-Z0-9 ]*$/);

export const ADDRESS_REGEX: RegExp = new RegExp(/^[a-zA-Z0-9\s,'\-\.#\/]+$/);
