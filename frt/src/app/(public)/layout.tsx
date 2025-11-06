import FooterSection from "@/components/base/footer/page";
import { Navbar } from "@/components/base/navbar/page";
import { CartProvider } from "@/components/provider/cart-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <Navbar/>
        {children}
        <FooterSection/>
        <CartProvider />
    </div>
  );
}
