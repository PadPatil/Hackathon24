import React, { useState } from 'react';

function ArticleSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handleSearchSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      try {
        const results = await searchArticles(searchQuery);
        setArticles(results);
      } catch (err) {
        setError('Failed to fetch articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="article-search">
        <h2>Search Scholarly Articles</h2>
        <form onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for scholarly articles about elections..."
          />
          <button type="submit">Search</button>
        </form>
        {loading && <p>Loading articles...</p>}
        {error && <p className="error">{error}</p>}
        <div className="articles-container">
          {articles.map((article, index) => (
            <Article key={index} {...article} />
          ))}
        </div>
      </div>
    );
  }

export default ArticleSearch;