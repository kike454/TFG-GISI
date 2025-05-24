

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');

chai.use(chaiHttp);

describe('Stripe Checkout Session', () => {
  it('should create a Stripe checkout session and return a URL', (done) => {
    chai.request(app)
      .post('/api/stripe/create-checkout-session')
      .send({ email: 'test@example.com' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('url');
        expect(res.body.url).to.be.a('string');
        expect(res.body.url).to.include('https://checkout.stripe.com');
        done();
      });
  });
});
