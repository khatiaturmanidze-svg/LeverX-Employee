import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link className="header__brand" to="/main">
      <h3 className="header__brand-secondary">leverx</h3>
      <h2 className="heading__brand-main">employee services</h2>
    </Link>
  );
}
