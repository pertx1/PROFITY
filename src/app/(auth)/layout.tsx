export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <span className="text-2xl font-semibold tracking-tight">PROFITY</span>
        <span className="text-sm text-secondary">
          Gastos, pedidos y beneficio de tu negocio
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
