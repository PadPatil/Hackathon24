function RelatedTopics({ topics }) {
    return (
      <div className="related-topics">
        <h2>Related Topics</h2>
        <ul>
          {topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      </div>
    );
  }