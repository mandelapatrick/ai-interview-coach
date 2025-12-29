import Navbar from "@/components/Navbar";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      {children}
    </div>
  );
}
