import Image from "next/image";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="container">
        <header className="page-header reveal">
          <Image
            src="/tourism-logo.png"
            alt="Incel Holidays and Tourism"
            width={382}
            height={159}
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
