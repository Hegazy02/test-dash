// Added comment to trigger Vercel redeploy
import { redirect } from "next/navigation";

async function getShortcut(name: string) {
  // const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const baseUrl = "https://test-dash-seven.vercel.app";

  const res = await fetch(`${baseUrl}/api/link/link?name=${name}&inc=1`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { name: string } }) {
  const shortcut = await getShortcut(params.name);
  if (!shortcut || !shortcut.link) {
    // يمكنك تخصيص صفحة الخطأ هنا
    return <div style={{ padding: 40, textAlign: 'center' }}>الرابط غير موجود</div>;
  }
  redirect(shortcut.link);
} 