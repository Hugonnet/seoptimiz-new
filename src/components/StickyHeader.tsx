import { Navigation } from "@/components/Navigation";

export function StickyHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] p-2">
        <div className="container mx-auto">
          <Navigation />
        </div>
      </div>
    </header>
  );
}