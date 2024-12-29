import { useEffect, useState } from 'react';

// components
import BreederDetails from '../components/BreederDetails';
import BreederUpdateForm from '../components/BreederUpdateForm';

const Home = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen">
      <BreederDetails />
      <BreederUpdateForm />
    </div>
  )
}

export default Home;