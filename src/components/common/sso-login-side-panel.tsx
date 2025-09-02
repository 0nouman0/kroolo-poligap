import React from "react";
import Image from "next/image";

const LoginSidePanel: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-1 bg-signin items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6">
        <Image
          src="/assets/img/ai-search-img.jpg" // or from public/images/example.jpg
          alt="Descriptive alt text"
          className="rounded-xl" // Optional: styling
          priority // Optional: loads image faster on first render
          height={800}
          width={600}
        />
      </div>
    </div>
  );
};

export default LoginSidePanel;
