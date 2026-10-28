'use client';

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:py-6 md:px-4">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-white pb-16 md:h-[844px] md:overflow-y-auto md:rounded-[36px] md:border md:border-black/5 md:shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:pb-16">
        {children}
      </div>
    </div>
  );
}
