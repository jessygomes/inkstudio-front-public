// import { BackButton } from "./BackButton";
// import { Social } from "./Social";

import { BackButton } from "./BackButton";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  // backButtonLabel: string;
  // backButtonHref: string;
  // showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
}: // backButtonLabel,
// backButtonHref,
// showSocial = false,
CardWrapperProps) => {
  return (
    <div className="w-full max-w-137.5 mx-auto flex flex-col gap-4 p-4 rounded-2xl">
      <div className="flex flex-col justify-between items-center">
        <h1 className="text-xl sm:text-lg p-2 rounded-t-[20px] text-white font-one tracking-widest uppercase font-semibold text-center w-full bg-linear-to-r from-tertiary-500/50 to-tertiary-400/50">
          {headerLabel}
        </h1>
        <div className="h-[0.6px] bg-white/60 w-full" />
      </div>

      <div>{children}</div>

      {/* {showSocial && (
        <div>
          <Social />
        </div>
      )} */}

      <div>
        {/* <BackButton label={backButtonLabel} href={backButtonHref} /> */}
      </div>
    </div>
  );
};
