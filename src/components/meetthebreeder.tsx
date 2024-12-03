import React from 'react';

const MeetTheBreeder: React.FC = () => {
  return (
    <section className="meet-breeder content-section">
      <h2>Meet the Breeder</h2>
      <div className="breeder-content">
        <div className="breeder-image">
          <img src="/images/sarah-profile.jpg" alt="Sarah Johnson - Dog Breeder" />
        </div>
        <div className="breeder-text">
          <p>
            Hi, I'm Sarah Johnson! With over 15 years of experience breeding Australian 
            Labradoodles, I'm committed to producing exceptional puppies that bring joy 
            to families.
          </p>
          <p>
            Our puppies are raised in our home with love and attention, ensuring they are 
            well-socialized and ready to become cherished members of their new families. 
            We follow strict health testing protocols and focus on breeding for 
            temperament, health, and conformation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MeetTheBreeder;
