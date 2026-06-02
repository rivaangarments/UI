import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

const whyChoose = [
  "Premium Quality Products",
  "Competitive Wholesale Pricing",
  "Pan India Delivery",
  "Secure Online Payments",
  "Dedicated Customer Support",
  "Bulk Order Discounts"
];

const categories = [
  "Printed Kurtis",
  "Embroidered Kurtis",
  "Cotton Kurtis",
  "Rayon Kurtis",
  "Designer Kurtis",
  "Festive Collection",
  "New Arrivals"
];

const CONTACT_PHONE = "9680624616";
const CONTACT_EMAIL = "garmentsrivaan.pvt.ltd@gmail.com";
const BUSINESS_ADDRESS =
  "185 Ward No 53, Handipura, Near Hanuman Mandir, Chak 1, Nangal Soosawatan, Jaipur, Amer, Rajasthan, India, 302028";

function Section({ id, title, children }) {
  return (
    <section className="about-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="page-main">
        <section className="about-hero">
          <div className="container">
            <span className="about-kicker">About us</span>
            <h1>Welcome to Rivaan Garments</h1>
            <p>
              India&apos;s trusted wholesale destination for premium ladies&apos; kurtis and ethnic wear. We provide
              quality apparel at competitive wholesale prices for retailers, resellers, boutiques, and distributors
              across India.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container about-layout">
            <aside className="about-nav luxury-panel" aria-label="About navigation">
              <b>Contents</b>
              <a href="#why-choose">Why Choose Us</a>
              <a href="#our-categories">Our Categories</a>
              <a href="#company">Company</a>
              <a href="#documents">Documents</a>
              <a href="#contact-us">Contact Us</a>
              <a href="#shipping-delivery">Shipping &amp; Delivery</a>
              <a href="#return-refund">Return &amp; Refund</a>
              <a href="#cancellation-policy">Cancellation</a>
              <a href="#privacy-policy">Privacy Policy</a>
              <a href="#terms-conditions">Terms &amp; Conditions</a>
            </aside>

            <div className="about-content">
              <Section id="why-choose" title="Why Choose Us?">
                <ul className="about-list">
                  {whyChoose.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Section>

              <Section id="our-categories" title="Our Categories">
                <ul className="about-list cols">
                  {categories.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Section>

              <Section id="company" title="Rivaan Garments">
                <p>
                  Rivaan Garments is a wholesale apparel company specializing in ladies&apos; ethnic wear. Our mission
                  is to provide retailers and resellers with high-quality products, competitive pricing, and reliable
                  delivery services.
                </p>
                <p>
                  We are committed to maintaining transparency, customer satisfaction, and long-term business
                  relationships.
                </p>
                <div className="about-meta luxury-panel">
                  <p><span>Business Name:</span> <b>Rivaan Garments India Private Limited</b></p>
                  <p><span>GST Number:</span> <b>XXXXXXXXX</b></p>
                  <p><span>Registered Address:</span> <b>{BUSINESS_ADDRESS}</b></p>
                  <p><span>Email:</span> <b><a className="about-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></b></p>
                  <p><span>Phone:</span> <b><a className="about-link" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></b></p>
                </div>
              </Section>

              <Section id="documents" title="Documents">
                <p>View or download our company documents below.</p>
                <div className="pdf-stack">
                  <details className="pdf-block" open>
                    <summary>mcari.pdf</summary>
                    <div className="pdf-actions">
                      <a className="about-link" href="/docs/mcari.pdf" target="_blank" rel="noreferrer">Open in new tab</a>
                      <a className="about-link" href="/docs/mcari.pdf" download>Download</a>
                    </div>
                    <object className="pdf-frame" data="/docs/mcari.pdf" type="application/pdf">
                      <p>
                        PDF preview isn&apos;t available in this browser.{" "}
                        <a className="about-link" href="/docs/mcari.pdf" target="_blank" rel="noreferrer">Open the PDF</a>.
                      </p>
                    </object>
                  </details>
                  <details className="pdf-block">
                    <summary>069Sx00000IlLJtIAN.pdf</summary>
                    <div className="pdf-actions">
                      <a className="about-link" href="/docs/069Sx00000IlLJtIAN.pdf" target="_blank" rel="noreferrer">Open in new tab</a>
                      <a className="about-link" href="/docs/069Sx00000IlLJtIAN.pdf" download>Download</a>
                    </div>
                    <object className="pdf-frame" data="/docs/069Sx00000IlLJtIAN.pdf" type="application/pdf">
                      <p>
                        PDF preview isn&apos;t available in this browser.{" "}
                        <a className="about-link" href="/docs/069Sx00000IlLJtIAN.pdf" target="_blank" rel="noreferrer">Open the PDF</a>.
                      </p>
                    </object>
                  </details>
                </div>
              </Section>

              <Section id="contact-us" title="CONTACT US">
                <h3 className="about-subhead">Customer Support</h3>
                <div className="about-meta luxury-panel">
                  <p><span>Phone:</span> <b><a className="about-link" href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></b></p>
                  <p><span>Email:</span> <b><a className="about-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></b></p>
                  <p><span>Business Address:</span> <b>{BUSINESS_ADDRESS}</b></p>
                  <p>
                    <span>Working Hours:</span>{" "}
                    <b>Monday to Saturday: 10:00 AM to 7:00 PM</b>
                  </p>
                  <p><span>Sunday:</span> <b>Closed</b></p>
                </div>
              </Section>

              <Section id="shipping-delivery" title="SHIPPING &amp; DELIVERY POLICY">
                <ul className="about-list">
                  <li>Orders are processed within 1-3 business days after payment confirmation.</li>
                  <li>Delivery timelines may vary depending on the destination and courier partner availability.</li>
                  <li><b>Estimated Delivery:</b></li>
                  <li>Metro Cities: 3-7 Business Days</li>
                  <li>Other Locations: 5-10 Business Days</li>
                  <li>Customers will receive shipment tracking details once the order is dispatched.</li>
                </ul>
              </Section>

              <Section id="return-refund" title="RETURN &amp; REFUND POLICY">
                <ul className="about-list">
                  <li>Returns are accepted only for damaged, defective, or incorrect products received by the customer.</li>
                  <li>Return requests must be raised within 48 hours of delivery.</li>
                  <li>Approved refunds will be processed within 7-10 business days to the original payment method.</li>
                  <li>Customized and bulk orders may not be eligible for returns unless the product received is defective.</li>
                </ul>
              </Section>

              <Section id="cancellation-policy" title="CANCELLATION POLICY">
                <ul className="about-list">
                  <li>Orders can be cancelled before dispatch.</li>
                  <li>Once an order has been shipped, cancellation requests cannot be accepted.</li>
                  <li>Refunds for approved cancellations will be processed within 7 business days.</li>
                </ul>
              </Section>

              <Section id="privacy-policy" title="PRIVACY POLICY">
                <ul className="about-list">
                  <li>We respect and protect customer privacy.</li>
                  <li>Personal information collected through the website is used only for order processing, customer support, and service improvement.</li>
                  <li>We do not sell or share customer information with unauthorized third parties.</li>
                  <li>Payment information is processed through secure payment gateways and is not stored on our servers.</li>
                </ul>
              </Section>

              <Section id="terms-conditions" title="TERMS &amp; CONDITIONS">
                <ul className="about-list">
                  <li>By using this website, customers agree to comply with all applicable laws and regulations.</li>
                  <li>Product prices, specifications, and availability are subject to change without prior notice.</li>
                  <li>The company reserves the right to refuse or cancel orders in cases of pricing errors, fraudulent transactions, or policy violations.</li>
                  <li>All disputes shall be subject to the jurisdiction of courts located in <b>Rajasthan</b>.</li>
                </ul>
              </Section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
