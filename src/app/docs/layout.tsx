import { getNavigation } from "@/lib/db";
import { DocsLayoutClient } from "@/components/docs/DocsLayoutClient";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigation = await getNavigation();

  return (
    <DocsLayoutClient navigation={navigation}>
      {children}
    </DocsLayoutClient>
  );
}
