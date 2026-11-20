import Link from "next/link";
import { Globe, Mail, Share2, Rss, Video } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: ["All products", "New arrivals", "Best sellers", "Sale"],
  },
  {
    title: "Support",
    links: ["Contact us", "FAQ", "Shipping", "Returns"],
  },
  {
    title: "Company",
    links: ["About us", "Careers", "Press", "Blog"],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-12">
      <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3">ShopClone</h3>
          <p className="text-sm text-muted-foreground">
            Your one-stop shop for everything you love.
          </p>
          <div className="flex gap-3 mt-4">
            {[Globe, Mail, Share2, Rss].map((Icon, i) => (
              <a key={i} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShopClone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
