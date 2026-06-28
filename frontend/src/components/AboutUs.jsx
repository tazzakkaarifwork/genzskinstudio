import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <section className="about-section py-5 my-5" style={{ background: '#0a0a0a', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
      <Container>
        <Row>
          <Col lg={6} className="mb-4 mb-lg-0">
            <h2 className="text-white display-5 fw-semibold">Beyond the filter.</h2>
            <p className="text-white-50 lead mt-3">
              GenZ Skin Studio was born from frustration. Frustration with overpriced, over‑hyped products that promise everything and deliver nothing.
            </p>
            <p className="text-white-50">
              We strip away the fluff – no pinkwashing, no 27‑step routines. Just <strong>black & white formulas</strong> that work: clean ingredients, dermatologically tested, 100% cruelty‑free. Our community isn't about chasing perfection; it's about owning your skin, exactly as it is.
            </p>
            <p className="text-white-50">
              ✦ Made for GenZ, by GenZ. ✦ Carbon‑neutral shipping. ✦ 1% for mental health.
            </p>
          </Col>
          <Col lg={6}>
            <div className="bg-white p-4 rounded-4" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
              <h4 className="text-white">What we believe</h4>
              <ul className="list-unstyled mt-3">
                <li className="mb-2 text-white-50">✔ No hidden toxins – full transparency</li>
                <li className="mb-2 text-white-50">✔ Genderless skincare – for everyone</li>
                <li className="mb-2 text-white-50">✔ Zero waste packaging (by 2025)</li>
              </ul>
              <hr className="border-secondary" />
              <p className="text-white-50 fst-italic mb-0">“Skin is not a trend. It's a lifetime relationship.”</p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutUs;