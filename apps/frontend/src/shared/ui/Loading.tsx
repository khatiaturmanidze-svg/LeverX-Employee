import React from 'react';

export default function Loading(): React.ReactElement {
  return (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__text">Loading...</p>
    </div>
  );
}
