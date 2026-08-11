import { InteriorPage } from "@/components/interior-page";

export default function ContactPage() {
  return (
    <InteriorPage
      description="A HUMAN READS EVERY VALID TRANSMISSION."
      eyebrow="// CONTACT / OPEN_CHANNEL"
      title="SEND A SIGNAL."
    >
      <div className="contact-layout">
        <form className="terminal-form">
          <label htmlFor="contact-name">01 / NAME</label>
          <input
            id="contact-name"
            name="name"
            placeholder="YOUR NAME"
            required
          />
          <label htmlFor="contact-email">02 / EMAIL</label>
          <input
            id="contact-email"
            name="email"
            placeholder="YOU@EXAMPLE.COM"
            required
            type="email"
          />
          <label htmlFor="contact-topic">03 / SUBJECT</label>
          <select id="contact-topic" name="topic" defaultValue="general">
            <option value="general">GENERAL</option>
            <option value="order">ORDER SUPPORT</option>
            <option value="wholesale">WHOLESALE</option>
          </select>
          <label htmlFor="contact-message">04 / MESSAGE</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="ENTER TRANSMISSION"
            required
            rows={7}
          />
          <button className="cursor-pointer" type="submit">
            TRANSMIT
          </button>
        </form>
        <aside className="contact-notes">
          <p>% expected_response</p>
          <strong>1–2 BUSINESS DAYS</strong>
          <p>% order_support</p>
          <strong>INCLUDE ORDER NUMBER</strong>
          <p>% direct_channel</p>
          <a href="mailto:hello@caffeinate.sh">HELLO@CAFFEINATE.SH</a>
        </aside>
      </div>
    </InteriorPage>
  );
}
