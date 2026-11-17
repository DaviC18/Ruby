import { Sidebar } from "@/components/painel/sidebar";
import { getDemoDay } from "@/lib/demo-data";

export default function PainelLayout({ children }: LayoutProps<"/">) {
  // TODO(fase 1, task 9): business name from current-tenant; attendant count from the API.
  const { businessName, attendantRequests } = getDemoDay(0);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar
        businessName={businessName}
        attendantCount={attendantRequests.length}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
