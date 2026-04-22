export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">
              B
            </div>
            <span className="text-3xl font-bold">BizPilot</span>
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            Your AI-powered back office
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Invoicing, scheduling, client management, and smart insights — all
            in one place. Built for small businesses that want to grow.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
