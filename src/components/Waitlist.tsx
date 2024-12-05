import { JoinWaitlist } from './joinwaitlist';
import { CheckWaitlist } from './checkwaitlist';
import '../styles/waitlist.css';

const Waitlist = () => {
  return (
    <div className="waitlist-section">
      <h2 className="waitlist-subtitle">Waitlist Management</h2>
      <p className="waitlist-description">
        Join our waitlist for upcoming litters or check your current position below.
      </p>
      <section className="waitlist-forms">
        <JoinWaitlist />
        <CheckWaitlist />
      </section>
    </div>
  );
};

export default Waitlist;
