import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TabBar } from "@/components/nav/TabBar";
import { Header } from "@/components/nav/Header";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await requireUser();

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header name={session.name} />
        <main className="flex-1 px-5 pb-24 pt-6 md:px-8 md:pb-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      <TabBar />
    </div>
  );
}
