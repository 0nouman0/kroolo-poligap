"use client";

import Link from "next/link";
import React from "react";

const TermsAndPrivacyLinks: React.FC = () => {
  return (
    <p className="mt-2 text-xs text-center text-gray-500">
      By signing up, You agree to Kroolo&apos;s{" "}
      <Link
        href={`https://kroolo.com/legal/terms-of-use`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-500"
      >
        Terms of Use
      </Link>{" "}
      and{" "}
      <Link
        href="https://kroolo.com/legal/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-500"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
};

export default TermsAndPrivacyLinks;
