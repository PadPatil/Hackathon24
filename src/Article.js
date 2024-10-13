import React from 'react';

function Article({ title, link, description }) {
    return (
      <div className="article">
        <h3><a href={link} target="_blank" rel="noopener noreferrer">{title}</a></h3>
        {description && <p>{description}</p>}
      </div>
    );
  }