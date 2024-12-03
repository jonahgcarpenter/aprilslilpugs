interface LiveProps {}

const Live: React.FC<LiveProps> = () => {
  return (
    <section className="content-section">
      <h1 className="section-title">April's Lil Pugs Live</h1>
      <p className="live-description">
        Watch our adorable pugs live! This stream shows our current litter in their play area.
      </p>
      <div className="live-iframe-wrapper">
        <div className="iframe-container">
          <iframe
            className="live-iframe"
            src="https://www.youtube.com/embed/live_stream?channel=UCGoYuWwpBLy4oVw1_c7P06Q"
            title="Puppies Live Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Live;
