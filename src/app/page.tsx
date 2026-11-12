import Image from "next/image";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container">
        <header className="page-header reveal">
          <Image
            src="/incel-logo.png"
            alt="Incel Holidays and Tourism"
            width={440}
            height={200}
            priority
            quality={95}
            className="page-header__logo"
          />
          <h1 className="page-header__title">Customer satisfaction form</h1>
          <p className="page-header__lede">
            Your feedback helps us serve you better. This form takes less than two
            minutes to complete. Thank you for travelling with us.
          </p>
        </header>

        <div className="reveal" style={{ animationDelay: "80ms" }}>
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
