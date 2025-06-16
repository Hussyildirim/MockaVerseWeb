import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = () => {
  return (
    <div className="text-center my-5">
      <Spinner
        animation="border"
        role="status"
        style={{
          width: '50px',
          height: '50px',
          margin: 'auto',
          display: 'block',
        }}
      >
        <span className="visually-hidden">Yükleniyor...</span>
      </Spinner>
      <div className="mt-2">Yükleniyor...</div>
    </div>
  );
};

export default Loader; 