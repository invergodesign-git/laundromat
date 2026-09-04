import { OpsShell } from "@/components/ops/OpsShell";
import { OpsStoreProvider } from "@/lib/ops/store";

export default function OpsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OpsStoreProvider>
      <OpsShell>{children}</OpsShell>
    </OpsStoreProvider>
  );
}
